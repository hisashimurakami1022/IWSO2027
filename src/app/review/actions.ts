"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const reviewSchema = z.object({
  rating: z.enum(["RECOMMENDED", "NEUTRAL", "NOT_RECOMMENDED", "NOT_APPLICABLE"], {
    message: "Select a rating",
  }),
});

export type ReviewActionState = {
  errors?: Record<string, string[]>;
  message?: string;
};

export async function saveReviewAction(
  prevState: ReviewActionState,
  formData: FormData
): Promise<ReviewActionState> {
  const user = await requireUser();
  const submissionId = formData.get("submissionId") as string;

  const assignment = await prisma.reviewAssignment.findUnique({
    where: { submissionId_reviewerId: { submissionId, reviewerId: user.id } },
  });
  if (!assignment) {
    return { message: "You are not assigned to review this submission." };
  }

  const parsed = reviewSchema.safeParse({
    rating: formData.get("rating"),
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  await prisma.review.upsert({
    where: { assignmentId: assignment.id },
    update: {
      rating: data.rating,
      submittedAt: new Date(),
    },
    create: {
      assignmentId: assignment.id,
      submissionId,
      reviewerId: user.id,
      rating: data.rating,
      submittedAt: new Date(),
    },
  });

  revalidatePath("/review");
  revalidatePath(`/admin/submissions/${submissionId}`);
  redirect("/review");
}
