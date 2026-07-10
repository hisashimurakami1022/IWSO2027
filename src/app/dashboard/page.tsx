import Link from "next/link";
import { requireUser } from "@/lib/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_LABELS } from "@/lib/labels";

export default async function DashboardPage() {
  const user = await requireUser();
  const isReviewer = user.roles.includes("REVIEWER") || user.roles.includes("CHAIR");
  const isChair = user.roles.includes("CHAIR");

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">ダッシュボード</h1>
        <p className="text-muted-foreground">
          {user.name ?? user.email} さん
          {user.roles.length > 0 && (
            <> ・ {user.roles.map((r) => ROLE_LABELS[r]).join(" / ")}</>
          )}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>投稿</CardTitle>
            <CardDescription>Abstractの投稿・編集・取下げ</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/submissions" className="text-sm underline underline-offset-4">
              投稿一覧を見る
            </Link>
          </CardContent>
        </Card>

        {isReviewer && (
          <Card>
            <CardHeader>
              <CardTitle>査読</CardTitle>
              <CardDescription>割り当てられた投稿の査読</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/review" className="text-sm underline underline-offset-4">
                査読一覧を見る
              </Link>
            </CardContent>
          </Card>
        )}

        {isChair && (
          <Card>
            <CardHeader>
              <CardTitle>管理</CardTitle>
              <CardDescription>投稿・査読・プログラムの管理</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin" className="text-sm underline underline-offset-4">
                管理画面を開く
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
