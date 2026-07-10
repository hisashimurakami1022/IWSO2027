"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleExpertiseAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Track = { id: string; name: string };

export function ExpertiseDialog({
  userId,
  tracks,
  expertiseTrackIds,
}: {
  userId: string;
  tracks: Track[];
  expertiseTrackIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(expertiseTrackIds));
  const [isPending, startTransition] = useTransition();

  function handleToggle(trackId: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(trackId);
      else next.delete(trackId);
      return next;
    });
    startTransition(async () => {
      try {
        await toggleExpertiseAction(userId, trackId, checked);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to update expertise");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            Expertise ({expertiseTrackIds.length})
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Track Expertise</DialogTitle>
          <DialogDescription>
            Used to prioritize this reviewer for submissions in matching tracks during
            auto-assignment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {tracks.map((t) => (
            <label key={t.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={selected.has(t.id)}
                disabled={isPending}
                onCheckedChange={(v) => handleToggle(t.id, v === true)}
              />
              <Label className="font-normal">{t.name}</Label>
            </label>
          ))}
          {tracks.length === 0 && (
            <p className="text-sm text-muted-foreground">No tracks yet.</p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
