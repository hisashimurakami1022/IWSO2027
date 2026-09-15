import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { completeSignInAction } from "./actions";

// Loading this page never consumes the sign-in request — it only looks the
// ref up to decide what to show. A mail security scanner can fetch this
// URL as many times as it likes; only submitting the form below (a real
// click, via completeSignInAction) actually signs the user in. See
// sendVerificationRequest in src/lib/auth.ts for why.
export default async function ConfirmSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const pending = ref ? await prisma.signInRequest.findUnique({ where: { ref } }) : null;
  const valid = !!pending && pending.expires > new Date();

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-24">
      <Card>
        <CardHeader>
          <CardTitle>Confirm sign-in</CardTitle>
          <CardDescription>
            {valid
              ? "For your security, click below to finish signing in to IWSO 12."
              : "This sign-in link is invalid or has expired. Request a new one from the sign-in page."}
          </CardDescription>
        </CardHeader>
        {valid && (
          <CardContent>
            <form action={completeSignInAction}>
              <input type="hidden" name="ref" value={ref} />
              <Button type="submit" size="lg" className="w-full">
                Complete Sign In
              </Button>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
