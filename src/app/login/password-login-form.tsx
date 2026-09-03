"use client";

import { useActionState } from "react";
import { loginWithPasswordAction, type PasswordLoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: PasswordLoginState = {};

export function PasswordLoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, isPending] = useActionState(loginWithPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />

      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="pw-email">Email address</Label>
        <Input id="pw-email" name="email" type="email" required placeholder="you@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pw-password">Password</Label>
        <Input id="pw-password" name="password" type="password" required />
      </div>
      <Button type="submit" variant="outline" className="w-full" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in with password"}
      </Button>
    </form>
  );
}
