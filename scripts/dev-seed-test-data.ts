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

  const minimalPdf = Buffer.from(
    "%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 3 3]>>endobj\ntrailer<</Root 1 0 R>>",
    "utf-8"
  );

  const submission = await prisma.submission.create({
    data: {
      title: "Collective Motion Patterns in Social Insect Swarms",
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
      file: {
        create: {
          fileName: "abstract.pdf",
          mimeType: "application/pdf",
          size: minimalPdf.byteLength,
          data: minimalPdf,
        },
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
