"use server";

import { revalidatePath } from "next/cache";
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
