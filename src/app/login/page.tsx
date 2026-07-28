import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// nginx is the only public entry point (see deploy/nginx.conf.example / DEPLOY.md),
// so the last hop it appends to X-Forwarded-For is the real client IP. Earlier,
// comma-separated values are client-supplied and not trustworthy.
async function getClientIp() {
  const forwardedFor = (await headers()).get("x-forwarded-for");
  const parts = forwardedFor?.split(",").map((p) => p.trim()).filter(Boolean) ?? [];
  return parts.at(-1) ?? "unknown";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;

  async function login(formData: FormData) {
    "use server";
    const email = (formData.get("email") as string).trim().toLowerCase();
    const ip = await getClientIp();

    // 1 email per address per minute, 5 attempts per IP per 10 minutes — stops
    // one submitter from spamming an unrelated address, or one source from
    // spraying sign-in emails at many addresses.
    const emailOk = checkRateLimit(`login:email:${email}`, 1, 60 * 1000);
    const ipOk = checkRateLimit(`login:ip:${ip}`, 5, 10 * 60 * 1000);

    if (!emailOk || !ipOk) {
      const params = new URLSearchParams({ error: "rate_limited" });
      if (callbackUrl) params.set("callbackUrl", callbackUrl);
      redirect(`/login?${params.toString()}`);
    }

    await signIn("resend", {
      email,
      redirectTo: callbackUrl || "/dashboard",
    });
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-24">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a sign-in link. Authors, reviewers,
            and organizers all sign in the same way.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error === "rate_limited" && (
            <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Too many sign-in requests. Please wait a minute and try again.
            </p>
          )}
          <form action={login} className="space-y-4">
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
    </div>
  );
}
