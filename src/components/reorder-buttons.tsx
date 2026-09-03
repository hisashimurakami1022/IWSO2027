"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ReorderButtons({
  id,
  isFirst,
  isLast,
  action,
}: {
  id: string;
  isFirst: boolean;
  isLast: boolean;
  action: (id: string, direction: "up" | "down") => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  function move(direction: "up" | "down") {
    startTransition(async () => {
      try {
        await action(id, direction);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to reorder");
      }
    });
  }

  return (
    <div className="flex flex-col">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-4 px-1 leading-none"
        disabled={isFirst || isPending}
        onClick={() => move("up")}
        aria-label="Move up"
      >
        ▲
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-4 px-1 leading-none"
        disabled={isLast || isPending}
        onClick={() => move("down")}
        aria-label="Move down"
      >
        ▼
      </Button>
    </div>
  );
}
