"use client";

import { useActionState, useState, type ReactElement } from "react";
import { saveSessionAction, type SessionActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PROGRAM_SESSION_TYPE_LABELS } from "@/lib/labels";

type Track = { id: string; name: string };

type SessionValues = {
  id: string;
  title: string;
  type: "ORAL_SESSION" | "POSTER_SESSION" | "KEYNOTE" | "BREAK";
  room: string | null;
  trackId: string | null;
  startTime: string;
  endTime: string;
};

const initialState: SessionActionState = {};

export function SessionFormDialog({
  session,
  tracks,
  trigger,
}: {
  session?: SessionValues;
  tracks: Track[];
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(saveSessionAction, initialState);
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
          <DialogTitle>{session ? "Edit Session" : "New Session"}</DialogTitle>
          <DialogDescription>Define a time slot for the conference program.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {session && <input type="hidden" name="id" value={session.id} />}

          {state.message && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.message}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required defaultValue={session?.title} />
            {state.errors?.title && (
              <p className="text-sm text-destructive">{state.errors.title[0]}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type" defaultValue={session?.type ?? "ORAL_SESSION"}>
                <SelectTrigger id="type" className="w-full">
                  <SelectValue>
                    {(value: keyof typeof PROGRAM_SESSION_TYPE_LABELS) =>
                      PROGRAM_SESSION_TYPE_LABELS[value]
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROGRAM_SESSION_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room">Room</Label>
              <Input id="room" name="room" defaultValue={session?.room ?? ""} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trackId">Track (optional)</Label>
            <Select name="trackId" defaultValue={session?.trackId ?? undefined}>
              <SelectTrigger id="trackId" className="w-full">
                <SelectValue placeholder="No specific track">
                  {(value: string | null) =>
                    tracks.find((t) => t.id === value)?.name ?? "No specific track"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {tracks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start</Label>
              <Input
                id="startTime"
                name="startTime"
                type="datetime-local"
                required
                defaultValue={session?.startTime}
              />
              {state.errors?.startTime && (
                <p className="text-sm text-destructive">{state.errors.startTime[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End</Label>
              <Input
                id="endTime"
                name="endTime"
                type="datetime-local"
                required
                defaultValue={session?.endTime}
              />
              {state.errors?.endTime && (
                <p className="text-sm text-destructive">{state.errors.endTime[0]}</p>
              )}
            </div>
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
