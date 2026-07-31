"use client";

import { useActionState } from "react";
import { saveReviewAction, type ReviewActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DECISION_LABELS } from "@/lib/labels";

const initialState: ReviewActionState = {};

type ReviewFormValues = {
  score?: number | null;
  recommendation?: "ACCEPT" | "REJECT" | null;
};

export function ReviewForm({
  submissionId,
  defaultValues,
}: {
  submissionId: string;
  defaultValues?: ReviewFormValues;
}) {
  const [state, formAction, isPending] = useActionState(saveReviewAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="submissionId" value={submissionId} />

      {state.message && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="score">Score (1-5)</Label>
          <Select
            name="score"
            defaultValue={defaultValues?.score ? String(defaultValues.score) : undefined}
          >
            <SelectTrigger id="score" className="w-full">
              <SelectValue placeholder="Select a score" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.score && <p className="text-sm text-destructive">{state.errors.score[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="recommendation">Recommendation</Label>
          <Select name="recommendation" defaultValue={defaultValues?.recommendation ?? undefined}>
            <SelectTrigger id="recommendation" className="w-full">
              <SelectValue placeholder="Select a recommendation">
                {(value: keyof typeof DECISION_LABELS | null) =>
                  value ? DECISION_LABELS[value] : "Select a recommendation"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DECISION_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.recommendation && (
            <p className="text-sm text-destructive">{state.errors.recommendation[0]}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Submit Review"}
      </Button>
    </form>
  );
}
