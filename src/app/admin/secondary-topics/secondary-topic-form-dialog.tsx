"use client";

import { useActionState, useState, type ReactElement } from "react";
import { saveSecondaryTopicAction, type SecondaryTopicActionState } from "./actions";
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

type SecondaryTopic = { id: string; name: string; code: string; description: string | null };

const initialState: SecondaryTopicActionState = {};

export function SecondaryTopicFormDialog({
  secondaryTopic,
  trigger,
}: {
  secondaryTopic?: SecondaryTopic;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(saveSecondaryTopicAction, initialState);
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
          <DialogTitle>{secondaryTopic ? "Edit Secondary Topic" : "New Secondary Topic"}</DialogTitle>
          <DialogDescription>
            Used as the optional Secondary Research Topic when submitting — an independent list
            from the (Primary) Research Topics.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {secondaryTopic && <input type="hidden" name="id" value={secondaryTopic.id} />}
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
              defaultValue={secondaryTopic?.name}
              placeholder="e.g. Device Characterization"
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
              defaultValue={secondaryTopic?.code}
              placeholder="e.g. DEVCHAR"
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
              defaultValue={secondaryTopic?.description ?? ""}
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
