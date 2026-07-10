import { prisma } from "@/lib/prisma";

export async function getConferenceSettings() {
  const settings = await prisma.conferenceSettings.findFirst();
  return (
    settings ?? {
      id: "",
      conferenceName: "IWSO 2027",
      timezone: "Asia/Tokyo",
      submissionDeadline: null,
      reviewDeadline: null,
      notificationDate: null,
      updatedAt: new Date(),
    }
  );
}

export async function isSubmissionOpen() {
  const settings = await getConferenceSettings();
  if (!settings.submissionDeadline) return true;
  return new Date() < settings.submissionDeadline;
}
