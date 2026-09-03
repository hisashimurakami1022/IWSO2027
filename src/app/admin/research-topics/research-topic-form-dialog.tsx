"use client";

import { useActionState, useState, type ReactElement } from "react";
import { saveResearchTopicAction, type ResearchTopicActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ResearchTopic = { id: string; name: string; code: string; description: string | null };

const initialState: ResearchTopicActionState = {};

export function ResearchTopicFormDialog({
  researchTopic,
  trigger,
}: {
  researchTopic?: ResearchTopic;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(saveResearchTopicAction, initialState);
  const [prevState, setPrevState] = useState(state);

  if (state !== prevState) {
    setPrevState(state);
    if (state.success) setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{researchTopic ? "Edit Research Topic" : "New Research Topic"}</DialogTitle>
          <DialogDescription>
            Research topics are used to categorize submissions (primary and optional secondary).
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {researchTopic && <input type="hidden" name="id" value={researchTopic.id} />}
          {state.message && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.message}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={researchTopic?.name}
              placeholder="e.g. Thin Film Growth"
            />
            {state.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              name="code"
              required
              defaultValue={researchTopic?.code}
              placeholder="e.g. GROWTH"
            />
            {state.errors?.code && (
              <p className="text-sm text-destructive">{state.errors.code[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={researchTopic?.description ?? ""}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
