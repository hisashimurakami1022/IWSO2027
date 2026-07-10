import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const submissions = await prisma.submission.findMany({
    where: { decision: { not: null } },
    select: { id: true, title: true, decision: true, status: true },
  });
  console.log(JSON.stringify(submissions, null, 2));
}

main().finally(() => prisma.$disconnect());
