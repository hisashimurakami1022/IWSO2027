"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { sendReviewRemindersAction } from "./actions";
import { Button } from "@/components/ui/button";

export function SendRemindersButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        const { sentCount } = await sendReviewRemindersAction();
        toast.success(
          sentCount > 0
            ? `Sent ${sentCount} reminder${sentCount === 1 ? "" : "s"}.`
            : "No pending reviews to remind."
        );
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to send reminders");
      }
    });
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={isPending}>
      {isPending ? "Sending..." : "Send Reminders"}
    </Button>
  );
}
