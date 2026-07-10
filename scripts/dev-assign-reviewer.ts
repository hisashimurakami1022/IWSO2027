import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const reviewer = await prisma.user.findUniqueOrThrow({ where: { email: "reviewer1@example.com" } });
  const submission = await prisma.submission.findFirstOrThrow({
    where: { title: { contains: "Collective Motion" } },
    orderBy: { createdAt: "desc" },
  });

  const existing = await prisma.reviewAssignment.findUnique({
    where: { submissionId_reviewerId: { submissionId: submission.id, reviewerId: reviewer.id } },
  });
  if (!existing) {
    await prisma.reviewAssignment.create({
      data: { submissionId: submission.id, reviewerId: reviewer.id },
    });
  }
  console.log(`Assigned reviewer1 to submission ${submission.id}`);
}

main().finally(() => prisma.$disconnect());
