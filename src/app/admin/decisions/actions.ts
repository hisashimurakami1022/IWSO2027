"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireChair } from "@/lib/session";
import { getConferenceSettings } from "@/lib/settings";
import { sendNotification } from "@/lib/notifications";
import { DecisionNotificationEmail } from "@/emails/decision-notification";
import { DECISION_LABELS } from "@/lib/labels";

async function notifySubmission(submissionId: string) {
  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
    include: { submitter: true, reviews: true },
  });
  if (!submission.decision) return;

  const settings = await getConferenceSettings();
  const comments = submission.reviews
    .map((r) => r.commentsForAuthor)
    .filter((c): c is string => !!c && c.trim().length > 0);

  await sendNotification({
    to: submission.submitter.email,
    subject: `[${settings.conferenceName}] Decision on your submission: ${DECISION_LABELS[submission.decision]}`,
    type: "DECISION_NOTIFICATION",
    userId: submission.submitterId,
    submissionId: submission.id,
    react: DecisionNotificationEmail({
      title: submission.title,
      conferenceName: settings.conferenceName,
      decision: submission.decision,
      comments,
    }),
  });
}

export async function sendDecisionNotificationAction(submissionId: string) {
  await requireChair();
  await notifySubmission(submissionId);
  revalidatePath("/admin/decisions");
}

export async function sendAllPendingNotificationsAction() {
  await requireChair();

  const pending = await prisma.submission.findMany({
    where: {
      status: "DECIDED",
      notificationLogs: { none: { type: "DECISION_NOTIFICATION" } },
    },
    select: { id: true },
  });

  for (const s of pending) {
    await notifySubmission(s.id);
  }

  revalidatePath("/admin/decisions");
  return { sentCount: pending.length };
}
