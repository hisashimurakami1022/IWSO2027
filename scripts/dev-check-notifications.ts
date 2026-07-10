import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.notificationLog.findMany({ orderBy: { sentAt: "desc" }, take: 10 });
  console.log(JSON.stringify(logs, null, 2));
}

main().finally(() => prisma.$disconnect());
