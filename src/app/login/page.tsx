import { loginWithLinkAction } from "./actions";
import { PasswordLoginForm } from "./password-login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center gap-6 px-4 py-24">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a sign-in link. This works for
            everyone, including your first time here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error === "rate_limited" && (
            <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Too many sign-in requests. Please wait a minute and try again.
            </p>
          )}
          <form action={loginWithLinkAction} className="space-y-4">
            <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full">
              Send sign-in link
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        OR
        <div className="h-px flex-1 bg-border" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sign in with a password</CardTitle>
          <CardDescription>
            Only works if you&apos;ve set a password already (from{" "}
            <span className="font-medium">Set Password</span> after signing in once).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordLoginForm callbackUrl={callbackUrl} />
        </CardContent>
      </Card>
    </div>
  );
}
