import { format } from "date-fns";
import { getConferenceSettings } from "@/lib/settings";
import { SettingsForm } from "./settings-form";

function toLocalInput(date: Date | null) {
  return date ? format(date, "yyyy-MM-dd'T'HH:mm") : "";
}

export default async function SettingsPage() {
  const settings = await getConferenceSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Conference Settings</h1>
      <SettingsForm
        defaultValues={{
          conferenceName: settings.conferenceName,
          timezone: settings.timezone,
          submissionDeadline: toLocalInput(settings.submissionDeadline),
          reviewDeadline: toLocalInput(settings.reviewDeadline),
          notificationDate: toLocalInput(settings.notificationDate),
          generalTalkMinutes: String(settings.generalTalkMinutes),
          invitedTalkMinutes: String(settings.invitedTalkMinutes),
        }}
      />
    </div>
  );
}
