"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireChair } from "@/lib/session";
import { PROGRAM_SESSION_TYPE_LABELS } from "@/lib/labels";

const sessionSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    type: z.enum(["ORAL_SESSION", "POSTER_SESSION", "KEYNOTE", "BREAK"]),
    room: z.string().trim().max(100).optional().or(z.literal("")),
    trackId: z.string().optional().or(z.literal("")),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export type SessionActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

export async function saveSessionAction(
  prevState: SessionActionState,
  formData: FormData
): Promise<SessionActionState> {
  await requireChair();
  const id = (formData.get("id") as string) || null;

  const parsed = sessionSchema.safeParse({
    title: formData.get("title"),
    type: formData.get("type"),
    room: formData.get("room"),
    trackId: formData.get("trackId"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const sessionData = {
    title: data.title,
    type: data.type,
    room: data.room || null,
    trackId: data.trackId || null,
    startTime: new Date(data.startTime),
    endTime: new Date(data.endTime),
  };

  if (id) {
    await prisma.programSession.update({ where: { id }, data: sessionData });
  } else {
    await prisma.programSession.create({ data: sessionData });
  }

  revalidatePath("/admin/program");
  revalidatePath("/program");
  return { success: true };
}

export async function deleteSessionAction(id: string) {
  await requireChair();
  await prisma.programSession.delete({ where: { id } });
  revalidatePath("/admin/program");
  revalidatePath("/program");
}

export async function assignSubmissionToSessionAction(sessionId: string, submissionId: string) {
  await requireChair();

  const session = await prisma.programSession.findUniqueOrThrow({ where: { id: sessionId } });
  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
    include: { authors: true },
  });

  const authorEmails = submission.authors.map((a) => a.email.toLowerCase());

  const otherAssignments = await prisma.programSessionSubmission.findMany({
    where: { submissionId: { not: submissionId } },
    include: { session: true, submission: { include: { authors: true } } },
  });

  const conflicts = otherAssignments.filter((a) => {
    const overlaps = a.session.startTime < session.endTime && a.session.endTime > session.startTime;
    if (!overlaps) return false;
    return a.submission.authors.some((au) => authorEmails.includes(au.email.toLowerCase()));
  });

  const maxOrder = await prisma.programSessionSubmission.aggregate({
    where: { sessionId },
    _max: { orderIndex: true },
  });

  await prisma.programSessionSubmission.create({
    data: {
      sessionId,
      submissionId,
      orderIndex: (maxOrder._max.orderIndex ?? -1) + 1,
    },
  });

  revalidatePath("/admin/program");
  revalidatePath("/program");

  if (conflicts.length > 0) {
    const titles = conflicts.map((c) => c.session.title).join(", ");
    return {
      warning: `Author time conflict: an author on this submission is also scheduled in ${titles} (${PROGRAM_SESSION_TYPE_LABELS[session.type]}).`,
    };
  }
  return {};
}

export async function removeSubmissionFromSessionAction(id: string) {
  await requireChair();
  await prisma.programSessionSubmission.delete({ where: { id } });
  revalidatePath("/admin/program");
  revalidatePath("/program");
}
