"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setDecisionAction } from "./actions";
import { Button } from "@/components/ui/button";
import type { Decision } from "@/generated/prisma/client";

export function DecisionButtons({
  submissionId,
  currentDecision,
}: {
  submissionId: string;
  currentDecision: Decision | null;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSet(decision: Decision) {
    startTransition(async () => {
      try {
        await setDecisionAction(submissionId, decision);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to set decision");
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={currentDecision === "ACCEPT" ? "default" : "outline"}
        onClick={() => handleSet("ACCEPT")}
        disabled={isPending}
      >
        Accept
      </Button>
      <Button
        variant={currentDecision === "REJECT" ? "destructive" : "outline"}
        onClick={() => handleSet("REJECT")}
        disabled={isPending}
      >
        Reject
      </Button>
    </div>
  );
}
