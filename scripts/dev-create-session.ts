import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { randomBytes } from "node:crypto";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] ?? "hisashi.murakami@gmail.com";
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  const sessionToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
  await prisma.session.create({
    data: { sessionToken, userId: user.id, expires },
  });
  console.log(sessionToken);
}

main().finally(() => prisma.$disconnect());
