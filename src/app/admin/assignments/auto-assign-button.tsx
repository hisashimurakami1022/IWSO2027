"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { autoAssignAction } from "./actions";
import { Button } from "@/components/ui/button";

export function AutoAssignButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        const { assignedCount } = await autoAssignAction();
        toast.success(
          assignedCount > 0
            ? `Assigned ${assignedCount} reviewer${assignedCount === 1 ? "" : "s"}.`
            : "No new assignments were needed."
        );
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Auto-assignment failed");
      }
    });
  }

  return (
    <Button onClick={handleClick} disabled={isPending}>
      {isPending ? "Assigning..." : "Auto-Assign Reviewers"}
    </Button>
  );
}
