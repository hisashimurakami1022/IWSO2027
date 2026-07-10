"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { submissionSchema } from "@/lib/validations";
import { getConferenceSettings, isSubmissionOpen } from "@/lib/settings";
import { sendNotification } from "@/lib/notifications";
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
    presentationType: formData.get("presentationType"),
    abstractText: formData.get("abstractText"),
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
    return { message: "投稿締切を過ぎているため、保存できません。" };
  }

  let existing = null;
  if (id) {
    existing = await prisma.submission.findUnique({ where: { id } });
    if (!existing || existing.submitterId !== user.id) {
      return { message: "投稿が見つかりません。" };
    }
    if (existing.status !== "DRAFT" && existing.status !== "SUBMITTED") {
      return { message: "この投稿は既に編集できない状態です。" };
    }
  }

  const parsed = submissionSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const status = intent === "submit" ? "SUBMITTED" : "DRAFT";
  const wasSubmitted = existing?.status === "SUBMITTED";

  const authorsData = data.authors.map((a, i) => ({
    name: a.name,
    email: a.email,
    affiliation: a.affiliation || null,
    isCorresponding: a.isCorresponding,
    order: i,
  }));

  const submission = existing
    ? await prisma.submission.update({
        where: { id: existing.id },
        data: {
          title: data.title,
          trackId: data.trackId,
          presentationType: data.presentationType,
          abstractText: data.abstractText,
          keywords: data.keywords,
          status,
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
          presentationType: data.presentationType,
          abstractText: data.abstractText,
          keywords: data.keywords,
          status,
          submitterId: user.id,
          submittedAt: status === "SUBMITTED" ? new Date() : null,
          authors: { create: authorsData },
        },
      });

  if (status === "SUBMITTED" && !wasSubmitted) {
    const settings = await getConferenceSettings();
    await sendNotification({
      to: user.email,
      subject: `[${settings.conferenceName}] 投稿を受け付けました`,
      type: "SUBMISSION_CONFIRMATION",
      userId: user.id,
      submissionId: submission.id,
      react: SubmissionConfirmationEmail({
        title: submission.title,
        conferenceName: settings.conferenceName,
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
    throw new Error("投稿が見つかりません。");
  }
  if (submission.status === "DECIDED" || submission.status === "WITHDRAWN") {
    throw new Error("この投稿は取下げできません。");
  }
  await prisma.submission.update({
    where: { id },
    data: { status: "WITHDRAWN", withdrawnAt: new Date() },
  });
  revalidatePath("/submissions");
}
