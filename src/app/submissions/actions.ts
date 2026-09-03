"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { submissionSchema, MAX_ABSTRACT_FILE_SIZE, ABSTRACT_FILE_MIME_TYPE } from "@/lib/validations";
import { getConferenceSettings, isSubmissionOpen } from "@/lib/settings";
import { sendNotification } from "@/lib/notifications";
import { APP_URL } from "@/lib/app-url";
import { allocateSubmissionCode } from "@/lib/submission-code";
import { SubmissionConfirmationEmail } from "@/emails/submission-confirmation";

export type SubmissionActionState = {
  errors?: Record<string, string[]>;
  message?: string;
};

function parseFormData(formData: FormData) {
  let keywords: unknown = [];
  let authors: unknown = [];
  try {
    keywords = JSON.parse((formData.get("keywordsJson") as string) || "[]");
  } catch {
    keywords = [];
  }
  try {
    authors = JSON.parse((formData.get("authorsJson") as string) || "[]");
  } catch {
    authors = [];
  }

  return {
    title: formData.get("title"),
    trackId: formData.get("trackId"),
    materialSystemId: formData.get("materialSystemId"),
    primaryTopicId: formData.get("primaryTopicId"),
    secondaryTopicId: formData.get("secondaryTopicId"),
    presentationType: formData.get("presentationType"),
    presentationCategory: formData.get("presentationCategory"),
    keywords,
    authors,
  };
}

export async function saveSubmissionAction(
  prevState: SubmissionActionState,
  formData: FormData
): Promise<SubmissionActionState> {
  const user = await requireUser();
  const id = (formData.get("id") as string) || null;
  const intent = formData.get("intent") === "submit" ? "submit" : "draft";

  const open = await isSubmissionOpen();
  if (!open) {
    return { message: "The submission deadline has passed, so this cannot be saved." };
  }

  let existing = null;
  if (id) {
    existing = await prisma.submission.findUnique({ where: { id }, include: { file: true } });
    if (!existing || existing.submitterId !== user.id) {
      return { message: "Submission not found." };
    }
    if (existing.status !== "DRAFT" && existing.status !== "SUBMITTED") {
      return { message: "This submission can no longer be edited." };
    }
  }

  const parsed = submissionSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const fileEntry = formData.get("abstractFile");
  const hasNewFile = fileEntry instanceof File && fileEntry.size > 0;

  if (hasNewFile) {
    const file = fileEntry as File;
    if (file.type !== ABSTRACT_FILE_MIME_TYPE) {
      return { errors: { abstractFile: ["Only PDF files are accepted."] } };
    }
    if (file.size > MAX_ABSTRACT_FILE_SIZE) {
      return { errors: { abstractFile: ["The file must be 10MB or smaller."] } };
    }
  }

  const data = parsed.data;
  const status = intent === "submit" ? "SUBMITTED" : "DRAFT";
  const wasSubmitted = existing?.status === "SUBMITTED";

  if (status === "SUBMITTED" && !hasNewFile && !existing?.file) {
    return { errors: { abstractFile: ["Please upload the abstract PDF before submitting."] } };
  }

  const authorsData = data.authors.map((a, i) => ({
    name: a.name,
    email: a.email,
    affiliation: a.affiliation || null,
    isCorresponding: a.isCorresponding,
    order: i,
  }));

  // Assigned once, at the moment a submission is first finalized — never
  // reassigned on later edits (the Presentation Category field locks once
  // this exists, so the two can't drift apart).
  const submissionCode =
    status === "SUBMITTED" && !wasSubmitted
      ? await allocateSubmissionCode(data.presentationCategory)
      : undefined;

  const submission = existing
    ? await prisma.submission.update({
        where: { id: existing.id },
        data: {
          title: data.title,
          trackId: data.trackId,
          materialSystemId: data.materialSystemId,
          primaryTopicId: data.primaryTopicId,
          secondaryTopicId: data.secondaryTopicId || null,
          presentationType: data.presentationType,
          presentationCategory: data.presentationCategory,
          keywords: data.keywords,
          status,
          ...(submissionCode ? { submissionCode } : {}),
          submittedAt:
            status === "SUBMITTED" ? (existing.submittedAt ?? new Date()) : existing.submittedAt,
          authors: {
            deleteMany: {},
            create: authorsData,
          },
        },
      })
    : await prisma.submission.create({
        data: {
          title: data.title,
          trackId: data.trackId,
          materialSystemId: data.materialSystemId,
          primaryTopicId: data.primaryTopicId,
          secondaryTopicId: data.secondaryTopicId || null,
          presentationType: data.presentationType,
          presentationCategory: data.presentationCategory,
          keywords: data.keywords,
          status,
          ...(submissionCode ? { submissionCode } : {}),
          submitterId: user.id,
          submittedAt: status === "SUBMITTED" ? new Date() : null,
          authors: { create: authorsData },
        },
      });

  if (hasNewFile) {
    const file = fileEntry as File;
    const buffer = Buffer.from(await file.arrayBuffer());
    await prisma.submissionFile.upsert({
      where: { submissionId: submission.id },
      update: { fileName: file.name, mimeType: file.type, size: file.size, data: buffer },
      create: {
        submissionId: submission.id,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        data: buffer,
      },
    });
  }

  if (status === "SUBMITTED" && !wasSubmitted) {
    const settings = await getConferenceSettings();
    await sendNotification({
      to: user.email,
      subject: `[${settings.conferenceName}] Submission received`,
      type: "SUBMISSION_CONFIRMATION",
      userId: user.id,
      submissionId: submission.id,
      react: SubmissionConfirmationEmail({
        title: submission.title,
        conferenceName: settings.conferenceName,
        submissionUrl: `${APP_URL}/submissions/${submission.id}`,
        submissionCode: submission.submissionCode,
      }),
    });
  }

  revalidatePath("/submissions");
  redirect("/submissions");
}

export async function withdrawSubmissionAction(id: string) {
  const user = await requireUser();
  const submission = await prisma.submission.findUnique({ where: { id } });
  if (!submission || submission.submitterId !== user.id) {
    throw new Error("Submission not found.");
  }
  if (submission.status === "DECIDED" || submission.status === "WITHDRAWN") {
    throw new Error("This submission cannot be withdrawn.");
  }
  await prisma.submission.update({
    where: { id },
    data: { status: "WITHDRAWN", withdrawnAt: new Date() },
  });
  revalidatePath("/submissions");
}
