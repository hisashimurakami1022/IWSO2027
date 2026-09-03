"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { assignSubmissionToSessionAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SubmissionOption = {
  id: string;
  title: string;
  keywords: string[];
  materialSystem: string | null;
  primaryTopic: string | null;
  secondaryTopic: string | null;
};

export function AssignSubmissionForm({
  sessionId,
  options,
}: {
  sessionId: string;
  options: SubmissionOption[];
}) {
  const [selected, setSelected] = useState("");
  const [filter, setFilter] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredOptions = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return options;
    return options.filter(
      (o) =>
        o.title.toLowerCase().includes(query) ||
        o.keywords.some((k) => k.toLowerCase().includes(query)) ||
        o.materialSystem?.toLowerCase().includes(query) ||
        o.primaryTopic?.toLowerCase().includes(query) ||
        o.secondaryTopic?.toLowerCase().includes(query)
    );
  }, [filter, options]);

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
    <div className="flex flex-wrap gap-2">
      <Input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by keyword, title, material, or topic"
        className="w-72"
      />
      <Select value={selected} onValueChange={(value) => setSelected(value ?? "")}>
        <SelectTrigger className="w-80">
          <SelectValue placeholder="Select a submission">
            {(value: string | null) =>
              options.find((o) => o.id === value)?.title ?? "Select a submission"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {filteredOptions.length === 0 ? (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">No matches</p>
          ) : (
            filteredOptions.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.title}
                {o.materialSystem && ` (${o.materialSystem})`}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={handleAssign} disabled={!selected || isPending}>
        {isPending ? "Adding..." : "Add"}
      </Button>
    </div>
  );
}
