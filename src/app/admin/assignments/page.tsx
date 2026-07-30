import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoAssignButton } from "./auto-assign-button";
import { AssignReviewerForm } from "./assign-reviewer-form";
import { RemoveAssignmentButton } from "./remove-assignment-button";
import { SendRemindersButton } from "./send-reminders-button";
import { SendReviewerNotificationButton } from "./send-reviewer-notification-button";
import { SendAllReviewerNotificationsButton } from "./send-all-reviewer-notifications-button";
import { getPendingReviewerNotifications } from "./actions";
import { SUBMISSION_STATUS_LABELS } from "@/lib/labels";

export default async function AssignmentsPage() {
  const [submissions, reviewers, pendingNotifications] = await Promise.all([
    prisma.submission.findMany({
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
      include: {
        track: true,
        authors: true,
        reviewAssignments: { include: { reviewer: true, review: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { roles: { has: "REVIEWER" } },
      orderBy: { email: "asc" },
    }),
    getPendingReviewerNotifications(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Review Assignments</h1>
        <div className="flex gap-2">
          <SendRemindersButton />
          <AutoAssignButton />
        </div>
      </div>

      {pendingNotifications.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">Pending Reviewer Notifications</CardTitle>
              <p className="text-sm text-muted-foreground">
                Assigning a reviewer doesn&apos;t email them right away — send notifications here,
                batched per reviewer, whenever you&apos;re ready.
              </p>
            </div>
            <SendAllReviewerNotificationsButton count={pendingNotifications.length} />
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingNotifications.map((p) => (
              <div key={p.reviewerId} className="flex items-center justify-between text-sm">
                <span>
                  {p.reviewerEmail}{" "}
                  <span className="text-muted-foreground">
                    ({p.submissions.length} submission{p.submissions.length === 1 ? "" : "s"})
                  </span>
                </span>
                <SendReviewerNotificationButton reviewerId={p.reviewerId} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No submissions awaiting review.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => {
            const assignedIds = new Set(s.reviewAssignments.map((a) => a.reviewerId));
            const authorEmails = new Set(s.authors.map((a) => a.email.toLowerCase()));
            const eligibleReviewers = reviewers
              .filter(
                (r) =>
                  !assignedIds.has(r.id) &&
                  !authorEmails.has(r.email.toLowerCase()) &&
                  r.id !== s.submitterId
              )
              .map((r) => ({ id: r.id, email: r.email }));

            return (
              <Card key={s.id}>
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                    {s.title}
                    <Badge variant="secondary">{SUBMISSION_STATUS_LABELS[s.status]}</Badge>
                    <span className="text-sm font-normal text-muted-foreground">{s.track.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {s.reviewAssignments.length > 0 && (
                    <div className="space-y-1">
                      {s.reviewAssignments.map((a) => (
                        <div key={a.id} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            {a.reviewer.email}
                            <Badge variant={a.review?.submittedAt ? "default" : "outline"}>
                              {a.review?.submittedAt ? "Reviewed" : "Pending"}
                            </Badge>
                          </span>
                          <RemoveAssignmentButton assignmentId={a.id} />
                        </div>
                      ))}
                    </div>
                  )}
                  <AssignReviewerForm submissionId={s.id} eligibleReviewers={eligibleReviewers} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
