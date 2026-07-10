"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { toggleRoleAction } from "./actions";
import { Checkbox } from "@/components/ui/checkbox";
import type { Role } from "@/generated/prisma/client";

export function RoleToggle({
  userId,
  role,
  checked,
}: {
  userId: string;
  role: Role;
  checked: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(value: boolean) {
    startTransition(async () => {
      try {
        await toggleRoleAction(userId, role, value);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to update role");
      }
    });
  }

  return (
    <Checkbox
      checked={checked}
      disabled={isPending}
      onCheckedChange={(v) => handleChange(v === true)}
    />
  );
}
