import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SendNotificationButton } from "./send-notification-button";
import { SendAllButton } from "./send-all-button";
import { DECISION_LABELS } from "@/lib/labels";

export default async function DecisionsPage() {
  const submissions = await prisma.submission.findMany({
    where: { status: "DECIDED" },
    include: {
      submitter: true,
      reviews: true,
      notificationLogs: { where: { type: "DECISION_NOTIFICATION" } },
    },
    orderBy: { decidedAt: "desc" },
  });

  const pendingCount = submissions.filter((s) => s.notificationLogs.length === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Decisions</h1>
          <p className="text-muted-foreground">
            Send accept/reject notifications to authors of decided submissions.
          </p>
        </div>
        {pendingCount > 0 && <SendAllButton count={pendingCount} />}
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No decisions recorded yet. Set a decision from a submission&apos;s detail page.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => {
            const comments = s.reviews
              .map((r) => r.commentsForAuthor)
              .filter((c): c is string => !!c && c.trim().length > 0);
            const notified = s.notificationLogs.length > 0;

            return (
              <Card key={s.id}>
                <CardContent className="space-y-2 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <Link
                        href={`/admin/submissions/${s.id}`}
                        className="font-medium hover:underline"
                      >
                        {s.title}
                      </Link>
                      <div className="text-sm text-muted-foreground">{s.submitter.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={s.decision === "ACCEPT" ? "default" : "destructive"}>
                        {s.decision && DECISION_LABELS[s.decision]}
                      </Badge>
                      {notified ? (
                        <Badge variant="secondary">Notified</Badge>
                      ) : (
                        <SendNotificationButton submissionId={s.id} />
                      )}
                    </div>
                  </div>
                  {comments.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Email will include {comments.length} reviewer comment
                      {comments.length === 1 ? "" : "s"} for the author.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
