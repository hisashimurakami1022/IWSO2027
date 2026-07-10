"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { assignSubmissionToSessionAction } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SubmissionOption = { id: string; title: string };

export function AssignSubmissionForm({
  sessionId,
  options,
}: {
  sessionId: string;
  options: SubmissionOption[];
}) {
  const [selected, setSelected] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAssign() {
    if (!selected) return;
    startTransition(async () => {
      try {
        const result = await assignSubmissionToSessionAction(sessionId, selected);
        if (result.warning) {
          toast.warning(result.warning);
        }
        setSelected("");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to assign submission");
      }
    });
  }

  if (options.length === 0) {
    return <p className="text-sm text-muted-foreground">No unassigned accepted submissions.</p>;
  }

  return (
    <div className="flex gap-2">
      <Select value={selected} onValueChange={(value) => setSelected(value ?? "")}>
        <SelectTrigger className="w-80">
          <SelectValue placeholder="Select a submission">
            {(value: string | null) =>
              options.find((o) => o.id === value)?.title ?? "Select a submission"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={handleAssign} disabled={!selected || isPending}>
        {isPending ? "Adding..." : "Add"}
      </Button>
    </div>
  );
}
