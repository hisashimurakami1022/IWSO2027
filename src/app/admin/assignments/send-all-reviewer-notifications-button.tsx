"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { sendAllPendingAssignmentNotificationsAction } from "./actions";
import { Button } from "@/components/ui/button";

export function SendAllReviewerNotificationsButton({ count }: { count: number }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        const { reviewerCount } = await sendAllPendingAssignmentNotificationsAction();
        toast.success(
          `Sent ${reviewerCount} notification${reviewerCount === 1 ? "" : "s"}.`
        );
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to send notifications");
      }
    });
  }

  return (
    <Button onClick={handleClick} disabled={isPending}>
      {isPending ? "Sending..." : `Send All Pending (${count})`}
    </Button>
  );
}
