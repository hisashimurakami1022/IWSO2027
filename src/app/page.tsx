import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const [settings, user] = await Promise.all([
    prisma.conferenceSettings.findFirst(),
    getCurrentUser(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 space-y-10">
      <section className="space-y-4 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          {settings?.conferenceName ?? "IWSO 2027"}
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Abstract Submission</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Submission, review, and program system for the IWSO 2027 international conference
          (scheduled for May 2027).
        </p>
        <div className="flex justify-center gap-3 pt-2">
          {user ? (
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/submissions/new">Submit an Abstract</Link>}
            />
          ) : (
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/login">Sign in to submit</Link>}
            />
          )}
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link href="/program">View Program</Link>}
          />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Submission Deadline</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">
            {settings?.submissionDeadline
              ? format(settings.submissionDeadline, "MMM d, yyyy (EEE) HH:mm")
              : "TBD"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review Deadline</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">
            {settings?.reviewDeadline
              ? format(settings.reviewDeadline, "MMM d, yyyy (EEE) HH:mm")
              : "TBD"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification Date</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">
            {settings?.notificationDate
              ? format(settings.notificationDate, "MMM d, yyyy (EEE)")
              : "TBD"}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
