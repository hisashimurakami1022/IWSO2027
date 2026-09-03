import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SetPasswordForm } from "./set-password-form";

export default async function AccountPasswordPage() {
  const user = await requireUser();
  const record = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  const hasPassword = !!record.passwordHash;

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">
          {hasPassword ? "Change Password" : "Set a Password"}
        </h1>
        <p className="text-muted-foreground">
          {hasPassword
            ? "Update the password you use to sign in."
            : "Optional. Once set, you can sign in with your email and this password instead of waiting for a sign-in link each time."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {hasPassword ? "Update Password" : "Set Password"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SetPasswordForm hasPassword={hasPassword} />
        </CardContent>
      </Card>
    </div>
  );
}
