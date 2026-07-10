"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireChair } from "@/lib/session";
import { getConferenceSettings } from "@/lib/settings";
import { sendNotification } from "@/lib/notifications";
import { ReviewerAssignedEmail } from "@/emails/reviewer-assigned";

const REVIEWERS_PER_SUBMISSION = 2;

async function notifyReviewer(reviewerEmail: string, reviewerId: string, submissionId: string, title: string) {
  const settings = await getConferenceSettings();
  await sendNotification({
    to: reviewerEmail,
    subject: `[${settings.conferenceName}] New submission assigned for review`,
    type: "REVIEWER_ASSIGNED",
    userId: reviewerId,
    submissionId,
    react: ReviewerAssignedEmail({ title, conferenceName: settings.conferenceName }),
  });
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

  await notifyReviewer(reviewer.email, reviewer.id, submission.id, submission.title);

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
      await notifyReviewer(reviewer.email, reviewer.id, submission.id, submission.title);
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
