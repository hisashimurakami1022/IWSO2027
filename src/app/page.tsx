import Link from "next/link";
import Image from "next/image";
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
    <div className="space-y-10 pb-16">
      <section className="relative flex min-h-[420px] items-center justify-center overflow-hidden sm:min-h-[480px]">
        <Image
          src="/images/fukuoka-skyline.jpg"
          alt="Fukuoka skyline at night"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-16 text-center text-white">
          <Image
            src="/images/iwso-logo.png"
            alt="IWSO 12 - 2027 Fukuoka, Japan - Semiconductor Oxides"
            width={120}
            height={120}
            priority
            className="drop-shadow-lg"
          />
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            {settings?.conferenceName ?? "IWSO 2027"}
          </h1>
          <p className="text-lg font-medium text-white/85 sm:text-xl">Abstract Submission</p>
          <p className="mx-auto max-w-2xl text-white/85">
            Submission, review, and program system for the IWSO 2027 international conference,
            held in Fukuoka, Japan (scheduled for May 2027).
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
              className="border-white/60 bg-white/10 text-white hover:bg-white/20"
              render={<Link href="/program">View Program</Link>}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-4xl gap-4 px-4 sm:grid-cols-3">
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
