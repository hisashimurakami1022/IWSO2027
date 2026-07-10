import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const assignments = await prisma.reviewAssignment.findMany({
    include: { reviewer: true, submission: true },
  });
  console.log(
    JSON.stringify(
      assignments.map((a) => ({
        id: a.id,
        reviewer: a.reviewer.email,
        submission: a.submission.title,
      })),
      null,
      2
    )
  );
}

main().finally(() => prisma.$disconnect());
