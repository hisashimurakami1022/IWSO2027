"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { removeSubmissionFromSessionAction } from "./actions";
import { Button } from "@/components/ui/button";

export function RemoveSubmissionButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        await removeSubmissionFromSessionAction(id);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to remove submission");
      }
    });
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} disabled={isPending}>
      {isPending ? "Removing..." : "Remove"}
    </Button>
  );
}
