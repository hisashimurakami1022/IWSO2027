"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { unassignReviewerAction } from "./actions";
import { Button } from "@/components/ui/button";

export function RemoveAssignmentButton({ assignmentId }: { assignmentId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        await unassignReviewerAction(assignmentId);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to remove assignment");
      }
    });
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} disabled={isPending}>
      {isPending ? "Removing..." : "Remove"}
    </Button>
  );
}
