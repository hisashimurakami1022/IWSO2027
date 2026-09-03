import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_LABELS } from "@/lib/labels";
import { SetPasswordPrompt } from "@/components/set-password-prompt";

export default async function DashboardPage() {
  const user = await requireUser();
  const isReviewer = user.roles.includes("REVIEWER") || user.roles.includes("CHAIR");
  const isChair = user.roles.includes("CHAIR");

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          {user.name ?? user.email}
          {user.roles.length > 0 && (
            <> &middot; {user.roles.map((r) => ROLE_LABELS[r]).join(" / ")}</>
          )}
        </p>
      </div>

      {!record?.passwordHash && <SetPasswordPrompt />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
            <CardDescription>Submit, edit, or withdraw your abstracts</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/submissions" className="text-sm underline underline-offset-4">
              View submissions
            </Link>
          </CardContent>
        </Card>

        {isReviewer && (
          <Card>
            <CardHeader>
              <CardTitle>Review</CardTitle>
              <CardDescription>Review your assigned submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/review" className="text-sm underline underline-offset-4">
                View review queue
              </Link>
            </CardContent>
          </Card>
        )}

        {isChair && (
          <Card>
            <CardHeader>
              <CardTitle>Admin</CardTitle>
              <CardDescription>Manage submissions, reviews, and the program</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin" className="text-sm underline underline-offset-4">
                Open admin panel
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
