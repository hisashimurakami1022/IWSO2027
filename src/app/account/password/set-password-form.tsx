"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { setPasswordAction, type SetPasswordState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: SetPasswordState = {};

export function SetPasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, formAction, isPending] = useActionState(setPasswordAction, initialState);

  useEffect(() => {
    if (state.success) toast.success(hasPassword ? "Password updated" : "Password set");
  }, [state, hasPassword]);

  return (
    <form action={formAction} className="max-w-sm space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">{hasPassword ? "New password" : "Password"}</Label>
        <Input id="password" name="password" type="password" required minLength={8} />
        {state.errors?.password && (
          <p className="text-sm text-destructive">{state.errors.password[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
        {state.errors?.confirmPassword && (
          <p className="text-sm text-destructive">{state.errors.confirmPassword[0]}</p>
        )}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : hasPassword ? "Update Password" : "Set Password"}
      </Button>
    </form>
  );
}
