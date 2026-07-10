"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { sendDecisionNotificationAction } from "./actions";
import { Button } from "@/components/ui/button";

export function SendNotificationButton({ submissionId }: { submissionId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        await sendDecisionNotificationAction(submissionId);
        toast.success("Notification sent.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to send notification");
      }
    });
  }

  return (
    <Button size="sm" onClick={handleClick} disabled={isPending}>
      {isPending ? "Sending..." : "Send"}
    </Button>
  );
}
