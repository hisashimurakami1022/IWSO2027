"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireChair } from "@/lib/session";
import { getConferenceSettings } from "@/lib/settings";

const settingsSchema = z.object({
  conferenceName: z.string().trim().min(1, "Conference name is required").max(200),
  timezone: z.string().trim().min(1, "Timezone is required").max(100),
  submissionDeadline: z.string().optional().or(z.literal("")),
  reviewDeadline: z.string().optional().or(z.literal("")),
  notificationDate: z.string().optional().or(z.literal("")),
  generalTalkMinutes: z.coerce.number().int().min(1).max(600),
  invitedTalkMinutes: z.coerce.number().int().min(1).max(600),
});

export type SettingsActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

export async function saveSettingsAction(
  prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  await requireChair();

  const parsed = settingsSchema.safeParse({
    conferenceName: formData.get("conferenceName"),
    timezone: formData.get("timezone"),
    submissionDeadline: formData.get("submissionDeadline"),
    reviewDeadline: formData.get("reviewDeadline"),
    notificationDate: formData.get("notificationDate"),
    generalTalkMinutes: formData.get("generalTalkMinutes"),
    invitedTalkMinutes: formData.get("invitedTalkMinutes"),
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const current = await getConferenceSettings();

  const updateData = {
    conferenceName: data.conferenceName,
    timezone: data.timezone,
    submissionDeadline: data.submissionDeadline ? new Date(data.submissionDeadline) : null,
    reviewDeadline: data.reviewDeadline ? new Date(data.reviewDeadline) : null,
    notificationDate: data.notificationDate ? new Date(data.notificationDate) : null,
    generalTalkMinutes: data.generalTalkMinutes,
    invitedTalkMinutes: data.invitedTalkMinutes,
  };

  if (current.id) {
    await prisma.conferenceSettings.update({ where: { id: current.id }, data: updateData });
  } else {
    await prisma.conferenceSettings.create({ data: updateData });
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/admin/program");
  revalidatePath("/program");
  return { success: true };
}
