import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const track = await prisma.track.findFirstOrThrow({ where: { code: "GENERAL" } });

  const reviewer = await prisma.user.upsert({
    where: { email: "reviewer1@example.com" },
    update: { roles: ["REVIEWER"] },
    create: { email: "reviewer1@example.com", name: "Reviewer One", roles: ["REVIEWER"] },
  });

  await prisma.reviewerExpertise.upsert({
    where: { reviewerId_trackId: { reviewerId: reviewer.id, trackId: track.id } },
    update: {},
    create: { reviewerId: reviewer.id, trackId: track.id },
  });

  const author = await prisma.user.upsert({
    where: { email: "author1@example.com" },
    update: {},
    create: { email: "author1@example.com", name: "Author One" },
  });

  const submission = await prisma.submission.create({
    data: {
      title: "Collective Motion Patterns in Social Insect Swarms",
      abstractText:
        "We investigate emergent collective motion patterns in social insect swarms using an agent-based simulation framework.",
      keywords: ["swarm", "collective behavior"],
      presentationType: "ORAL",
      status: "SUBMITTED",
      submittedAt: new Date(),
      trackId: track.id,
      submitterId: author.id,
      authors: {
        create: [
          {
            name: "Author One",
            email: "author1@example.com",
            affiliation: "Test University",
            isCorresponding: true,
            order: 0,
          },
        ],
      },
    },
  });

  console.log(`Reviewer: ${reviewer.email}`);
  console.log(`Author: ${author.email}`);
  console.log(`Submission: ${submission.id} - ${submission.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
