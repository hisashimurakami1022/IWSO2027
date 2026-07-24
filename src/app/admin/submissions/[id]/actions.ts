"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireChair } from "@/lib/session";
import type { Decision } from "@/generated/prisma/client";

export async function setDecisionAction(submissionId: string, decision: Decision) {
  await requireChair();
  await prisma.submission.update({
    where: { id: submissionId },
    data: { decision, decidedAt: new Date(), status: "DECIDED" },
  });
  revalidatePath(`/admin/submissions/${submissionId}`);
  revalidatePath("/admin/decisions");
}

export async function deleteSubmissionAction(submissionId: string) {
  await requireChair();
  await prisma.submission.delete({ where: { id: submissionId } });
  revalidatePath("/admin/submissions");
  revalidatePath("/admin/decisions");
  revalidatePath("/admin");
  redirect("/admin/submissions");
}
