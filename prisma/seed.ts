import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.conferenceSettings.findFirst();
  if (!settings) {
    await prisma.conferenceSettings.create({
      data: {
        conferenceName: "IWSO 2027",
        timezone: "Asia/Tokyo",
        submissionDeadline: new Date("2027-01-15T23:59:00+09:00"),
        reviewDeadline: new Date("2027-02-15T23:59:00+09:00"),
        notificationDate: new Date("2027-03-01T00:00:00+09:00"),
      },
    });
    console.log("Created ConferenceSettings");
  }

  await prisma.track.upsert({
    where: { code: "GENERAL" },
    update: {},
    create: {
      code: "GENERAL",
      name: "General",
      description: "General, uncategorized track",
    },
  });
  console.log("Ensured default Track");

  const chairEmail = "hisashi.murakami@gmail.com";
  const chair = await prisma.user.upsert({
    where: { email: chairEmail },
    update: { roles: { set: ["CHAIR"] } },
    create: {
      email: chairEmail,
      name: "Hisashi Murakami",
      roles: ["CHAIR"],
    },
  });
  console.log(`Ensured CHAIR user: ${chair.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
