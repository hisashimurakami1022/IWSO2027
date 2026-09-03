// Experimental: nudges a user who signed in via magic link (and has no
// password yet) to set one, so they don't have to wait on email every time.
// Shown on /dashboard, the default landing page right after sign-in. Easy to
// remove later — just drop the <SetPasswordPrompt /> usage and this file.
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function SetPasswordPrompt() {
  return (
    <Alert className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <AlertTitle>Skip the email next time</AlertTitle>
        <AlertDescription>
          Set a password now and you can sign in directly, without waiting for a link.
        </AlertDescription>
      </div>
      <Button
        size="sm"
        variant="outline"
        nativeButton={false}
        render={<Link href="/account/password">Set Password</Link>}
      />
    </Alert>
  );
}
