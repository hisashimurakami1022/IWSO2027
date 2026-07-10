"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { assignReviewerAction } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Reviewer = { id: string; email: string };

export function AssignReviewerForm({
  submissionId,
  eligibleReviewers,
}: {
  submissionId: string;
  eligibleReviewers: Reviewer[];
}) {
  const [selected, setSelected] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAssign() {
    if (!selected) return;
    startTransition(async () => {
      try {
        await assignReviewerAction(submissionId, selected);
        setSelected("");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to assign reviewer");
      }
    });
  }

  if (eligibleReviewers.length === 0) {
    return <p className="text-sm text-muted-foreground">No eligible reviewers available.</p>;
  }

  return (
    <div className="flex gap-2">
      <Select value={selected} onValueChange={(value) => setSelected(value ?? "")}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select a reviewer" />
        </SelectTrigger>
        <SelectContent>
          {eligibleReviewers.map((r) => (
            <SelectItem key={r.id} value={r.id}>
              {r.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={handleAssign} disabled={!selected || isPending}>
        {isPending ? "Assigning..." : "Assign"}
      </Button>
    </div>
  );
}
