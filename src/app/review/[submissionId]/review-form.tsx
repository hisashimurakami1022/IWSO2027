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
import { REVIEW_RATING_LABELS } from "@/lib/labels";
import type { ReviewRating } from "@/generated/prisma/client";

const initialState: ReviewActionState = {};

type ReviewFormValues = {
  rating?: ReviewRating | null;
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

      <div className="space-y-2">
        <Label htmlFor="rating">Rating</Label>
        <Select name="rating" defaultValue={defaultValues?.rating ?? undefined}>
          <SelectTrigger id="rating" className="w-full">
            <SelectValue placeholder="Select a rating">
              {(value: ReviewRating | null) => (value ? REVIEW_RATING_LABELS[value] : "Select a rating")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(REVIEW_RATING_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.errors?.rating && <p className="text-sm text-destructive">{state.errors.rating[0]}</p>}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Submit Review"}
      </Button>
    </form>
  );
}
