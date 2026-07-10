import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
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
        <h1 className="text-4xl font-bold tracking-tight">Abstract投稿受付</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          国際会議 IWSO 2027(2027年5月開催予定)のAbstract投稿・査読・プログラム編成を行うシステムです。
        </p>
        <div className="flex justify-center gap-3 pt-2">
          {user ? (
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/submissions/new">Abstractを投稿する</Link>}
            />
          ) : (
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/login">ログインして投稿を始める</Link>}
            />
          )}
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link href="/program">プログラムを見る</Link>}
          />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">投稿締切</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">
            {settings?.submissionDeadline
              ? format(settings.submissionDeadline, "yyyy年M月d日(E) HH:mm", { locale: ja })
              : "未定"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">査読締切</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">
            {settings?.reviewDeadline
              ? format(settings.reviewDeadline, "yyyy年M月d日(E) HH:mm", { locale: ja })
              : "未定"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">採否通知</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">
            {settings?.notificationDate
              ? format(settings.notificationDate, "yyyy年M月d日(E)", { locale: ja })
              : "未定"}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
