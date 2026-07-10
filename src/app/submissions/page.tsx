import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SUBMISSION_STATUS_LABELS, PRESENTATION_TYPE_LABELS } from "@/lib/labels";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  DRAFT: "outline",
  SUBMITTED: "secondary",
  UNDER_REVIEW: "secondary",
  DECIDED: "default",
  WITHDRAWN: "destructive",
};

export default async function SubmissionsPage() {
  const user = await requireUser();
  const submissions = await prisma.submission.findMany({
    where: { submitterId: user.id },
    include: { track: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">投稿一覧</h1>
          <p className="text-muted-foreground">あなたが投稿したAbstract一覧です。</p>
        </div>
        <Button render={<Link href="/submissions/new">新規投稿</Link>} />
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            まだ投稿がありません。
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0 space-y-1">
                  <Link href={`/submissions/${s.id}`} className="font-medium hover:underline">
                    {s.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>{s.track.name}</span>
                    <span>・</span>
                    <span>{PRESENTATION_TYPE_LABELS[s.presentationType]}</span>
                  </div>
                </div>
                <Badge variant={STATUS_VARIANT[s.status]}>
                  {SUBMISSION_STATUS_LABELS[s.status]}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
