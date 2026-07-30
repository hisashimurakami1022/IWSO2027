"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireChair } from "@/lib/session";
import { getConferenceSettings } from "@/lib/settings";
import { sendNotification } from "@/lib/notifications";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { APP_URL } from "@/lib/app-url";
import { ReviewerAssignedEmail } from "@/emails/reviewer-assigned";
import { ReviewReminderEmail } from "@/emails/review-reminder";

const REVIEWERS_PER_SUBMISSION = 2;

// Assignment notifications are batched rather than sent per-assignment, so a
// reviewer given several submissions at once (e.g. by auto-assign) gets one
// email listing all of them instead of one email each. "Pending" is tracked
// directly on ReviewAssignment.notifiedAt, so unassigning and reassigning a
// reviewer (a fresh row, notifiedAt null) always counts as pending again,
// regardless of any older notification history for that reviewer/submission
// pair. See getPendingReviewerNotifications / send*PendingAssignmentNotifications*.
async function notifyReviewerBatch(
  reviewerId: string,
  reviewerEmail: string,
  submissions: { id: string; title: string }[]
) {
  const settings = await getConferenceSettings();
  const plural = submissions.length > 1;
  const subject = `[${settings.conferenceName}] ${submissions.length} submission${plural ? "s" : ""} assigned for review`;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: reviewerEmail,
      subject,
      react: ReviewerAssignedEmail({
        submissions: submissions.map((s) => ({
          title: s.title,
          url: `${APP_URL}/review/${s.id}`,
        })),
        conferenceName: settings.conferenceName,
        reviewQueueUrl: `${APP_URL}/review`,
      }),
    });
    const notifiedAt = new Date();
    await prisma.notificationLog.createMany({
      data: submissions.map((s) => ({
        type: "REVIEWER_ASSIGNED" as const,
        subject,
        recipient: reviewerEmail,
        userId: reviewerId,
        submissionId: s.id,
      })),
    });
    await prisma.reviewAssignment.updateMany({
      where: { reviewerId, submissionId: { in: submissions.map((s) => s.id) } },
      data: { notifiedAt },
    });
  } catch (error) {
    console.error(`Failed to send reviewer-assigned notification to ${reviewerEmail}:`, error);
  }
}

export async function getPendingReviewerNotifications() {
  const assignments = await prisma.reviewAssignment.findMany({
    where: { notifiedAt: null },
    include: { reviewer: true, submission: true },
    orderBy: { assignedAt: "asc" },
  });

  const byReviewer = new Map<
    string,
    { reviewerId: string; reviewerEmail: string; submissions: { id: string; title: string }[] }
  >();

  for (const a of assignments) {
    const entry = byReviewer.get(a.reviewerId) ?? {
      reviewerId: a.reviewerId,
      reviewerEmail: a.reviewer.email,
      submissions: [],
    };
    entry.submissions.push({ id: a.submission.id, title: a.submission.title });
    byReviewer.set(a.reviewerId, entry);
  }

  return Array.from(byReviewer.values());
}

export async function sendReviewerAssignmentNotificationAction(reviewerId: string) {
  await requireChair();
  const pending = await getPendingReviewerNotifications();
  const entry = pending.find((p) => p.reviewerId === reviewerId);
  if (!entry) return;

  await notifyReviewerBatch(entry.reviewerId, entry.reviewerEmail, entry.submissions);
  revalidatePath("/admin/assignments");
}

export async function sendAllPendingAssignmentNotificationsAction() {
  await requireChair();
  const pending = await getPendingReviewerNotifications();

  for (const entry of pending) {
    await notifyReviewerBatch(entry.reviewerId, entry.reviewerEmail, entry.submissions);
  }

  revalidatePath("/admin/assignments");
  return { reviewerCount: pending.length };
}

export async function assignReviewerAction(submissionId: string, reviewerId: string) {
  const actor = await requireChair();

  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
    include: { authors: true },
  });
  const reviewer = await prisma.user.findUniqueOrThrow({ where: { id: reviewerId } });

  const isConflict =
    submission.submitterId === reviewer.id ||
    submission.authors.some((a) => a.email.toLowerCase() === reviewer.email.toLowerCase());
  if (isConflict) {
    throw new Error("This reviewer has a conflict of interest with this submission.");
  }

  const existing = await prisma.reviewAssignment.findUnique({
    where: { submissionId_reviewerId: { submissionId, reviewerId } },
  });
  if (existing) {
    throw new Error("This reviewer is already assigned to this submission.");
  }

  await prisma.reviewAssignment.create({
    data: { submissionId, reviewerId, assignedBy: actor.id },
  });

  if (submission.status === "SUBMITTED") {
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: "UNDER_REVIEW" },
    });
  }

  revalidatePath("/admin/assignments");
}

export async function unassignReviewerAction(assignmentId: string) {
  await requireChair();
  await prisma.reviewAssignment.delete({ where: { id: assignmentId } });
  revalidatePath("/admin/assignments");
}

export async function autoAssignAction() {
  const actor = await requireChair();

  const [submissions, reviewers] = await Promise.all([
    prisma.submission.findMany({
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
      include: {
        authors: true,
        reviewAssignments: true,
      },
    }),
    prisma.user.findMany({
      where: { roles: { has: "REVIEWER" } },
      include: { reviewerExpertise: true, reviewAssignments: true },
    }),
  ]);

  const loadMap = new Map(reviewers.map((r) => [r.id, r.reviewAssignments.length]));
  let assignedCount = 0;

  for (const submission of submissions) {
    const needed = REVIEWERS_PER_SUBMISSION - submission.reviewAssignments.length;
    if (needed <= 0) continue;

    const authorEmails = new Set(submission.authors.map((a) => a.email.toLowerCase()));
    const alreadyAssignedIds = new Set(submission.reviewAssignments.map((a) => a.reviewerId));

    const candidates = reviewers.filter(
      (r) =>
        !alreadyAssignedIds.has(r.id) &&
        !authorEmails.has(r.email.toLowerCase()) &&
        r.id !== submission.submitterId
    );

    candidates.sort((a, b) => {
      const aMatch = a.reviewerExpertise.some((e) => e.trackId === submission.trackId) ? 0 : 1;
      const bMatch = b.reviewerExpertise.some((e) => e.trackId === submission.trackId) ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      return (loadMap.get(a.id) ?? 0) - (loadMap.get(b.id) ?? 0);
    });

    const picked = candidates.slice(0, needed);

    for (const reviewer of picked) {
      await prisma.reviewAssignment.create({
        data: { submissionId: submission.id, reviewerId: reviewer.id, assignedBy: actor.id },
      });
      loadMap.set(reviewer.id, (loadMap.get(reviewer.id) ?? 0) + 1);
      assignedCount += 1;
    }

    if (picked.length > 0 && submission.status === "SUBMITTED") {
      await prisma.submission.update({
        where: { id: submission.id },
        data: { status: "UNDER_REVIEW" },
      });
    }
  }

  revalidatePath("/admin/assignments");
  return { assignedCount };
}

export async function sendReviewRemindersAction() {
  await requireChair();

  const pendingAssignments = await prisma.reviewAssignment.findMany({
    where: { review: null },
    include: { reviewer: true, submission: true },
  });

  const settings = await getConferenceSettings();
  let sentCount = 0;

  for (const assignment of pendingAssignments) {
    await sendNotification({
      to: assignment.reviewer.email,
      subject: `[${settings.conferenceName}] Reminder: review pending`,
      type: "REVIEW_REMINDER",
      userId: assignment.reviewerId,
      submissionId: assignment.submissionId,
      react: ReviewReminderEmail({
        title: assignment.submission.title,
        conferenceName: settings.conferenceName,
        reviewUrl: `${APP_URL}/review/${assignment.submissionId}`,
      }),
    });
    sentCount += 1;
  }

  return { sentCount };
}
