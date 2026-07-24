"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteSubmissionAction } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteSubmissionButton({ submissionId }: { submissionId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await deleteSubmissionAction(submissionId);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to delete submission");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive">Delete submission</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Permanently delete this submission?</DialogTitle>
          <DialogDescription>
            This removes the submission, its abstract file, authors, review assignments, and
            reviews. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
