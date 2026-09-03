import { prisma } from "@/lib/prisma";
import type { PresentationCategory } from "@/generated/prisma/client";

const PREFIXES: Record<PresentationCategory, string> = {
  GENERAL: "C",
  INVITED: "I",
};

/**
 * Atomically allocates the next submission code for a category (C0001,
 * C0002, ... / I0001, I0002, ...). The upsert-with-increment is a single
 * row-locking SQL statement, so two submissions in the same category can
 * never be handed the same number even if submitted at the same instant.
 */
export async function allocateSubmissionCode(category: PresentationCategory): Promise<string> {
  const counter = await prisma.submissionCounter.upsert({
    where: { category },
    update: { lastAssigned: { increment: 1 } },
    create: { category, lastAssigned: 1 },
    select: { lastAssigned: true },
  });
  return `${PREFIXES[category]}${String(counter.lastAssigned).padStart(4, "0")}`;
}
