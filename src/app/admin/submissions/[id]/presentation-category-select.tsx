"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setPresentationCategoryAction } from "./actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRESENTATION_CATEGORY_LABELS } from "@/lib/labels";
import type { PresentationCategory } from "@/generated/prisma/client";

export function PresentationCategorySelect({
  submissionId,
  value,
}: {
  submissionId: string;
  value: PresentationCategory;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(next: string | null) {
    if (!next || next === value) return;
    startTransition(async () => {
      try {
        await setPresentationCategoryAction(submissionId, next as PresentationCategory);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to update presentation category");
      }
    });
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-40">
        <SelectValue>
          {(v: string | null) =>
            PRESENTATION_CATEGORY_LABELS[(v ?? value) as PresentationCategory]
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(PRESENTATION_CATEGORY_LABELS).map(([key, label]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
