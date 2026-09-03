"use client";

import { useActionState, useState, type ReactElement } from "react";
import { saveMaterialSystemAction, type MaterialSystemActionState } from "./actions";
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

type MaterialSystem = { id: string; name: string; code: string; description: string | null };

const initialState: MaterialSystemActionState = {};

export function MaterialSystemFormDialog({
  materialSystem,
  trigger,
}: {
  materialSystem?: MaterialSystem;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(saveMaterialSystemAction, initialState);
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
          <DialogTitle>{materialSystem ? "Edit Material System" : "New Material System"}</DialogTitle>
          <DialogDescription>
            Material systems are used to categorize submissions by material.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {materialSystem && <input type="hidden" name="id" value={materialSystem.id} />}
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
              defaultValue={materialSystem?.name}
              placeholder="e.g. Ga2O3"
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
              defaultValue={materialSystem?.code}
              placeholder="e.g. GAO"
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
              defaultValue={materialSystem?.description ?? ""}
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
