"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { saveSettingsAction, type SettingsActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: SettingsActionState = {};

export function SettingsForm({
  defaultValues,
}: {
  defaultValues: {
    conferenceName: string;
    timezone: string;
    submissionDeadline: string;
    reviewDeadline: string;
    notificationDate: string;
    generalTalkMinutes: string;
    invitedTalkMinutes: string;
  };
}) {
  const [state, formAction, isPending] = useActionState(saveSettingsAction, initialState);

  useEffect(() => {
    if (state.success) toast.success("Settings saved");
  }, [state]);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      {state.message && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="conferenceName">Conference Name</Label>
        <Input
          id="conferenceName"
          name="conferenceName"
          required
          defaultValue={defaultValues.conferenceName}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Input
          id="timezone"
          name="timezone"
          required
          defaultValue={defaultValues.timezone}
          placeholder="Asia/Tokyo"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="submissionDeadline">Submission Deadline</Label>
        <Input
          id="submissionDeadline"
          name="submissionDeadline"
          type="datetime-local"
          defaultValue={defaultValues.submissionDeadline}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reviewDeadline">Review Deadline</Label>
        <Input
          id="reviewDeadline"
          name="reviewDeadline"
          type="datetime-local"
          defaultValue={defaultValues.reviewDeadline}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notificationDate">Notification Date</Label>
        <Input
          id="notificationDate"
          name="notificationDate"
          type="datetime-local"
          defaultValue={defaultValues.notificationDate}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="generalTalkMinutes">General Talk Duration (minutes)</Label>
          <Input
            id="generalTalkMinutes"
            name="generalTalkMinutes"
            type="number"
            min={1}
            max={600}
            required
            defaultValue={defaultValues.generalTalkMinutes}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invitedTalkMinutes">Invited Talk Duration (minutes)</Label>
          <Input
            id="invitedTalkMinutes"
            name="invitedTalkMinutes"
            type="number"
            min={1}
            max={600}
            required
            defaultValue={defaultValues.invitedTalkMinutes}
          />
        </div>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
