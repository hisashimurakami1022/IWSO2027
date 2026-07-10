import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoAssignButton } from "./auto-assign-button";
import { AssignReviewerForm } from "./assign-reviewer-form";
import { RemoveAssignmentButton } from "./remove-assignment-button";
import { SUBMISSION_STATUS_LABELS } from "@/lib/labels";

export default async function AssignmentsPage() {
  const [submissions, reviewers] = await Promise.all([
    prisma.submission.findMany({
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
      include: {
        track: true,
        authors: true,
        reviewAssignments: { include: { reviewer: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { roles: { has: "REVIEWER" } },
      orderBy: { email: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Review Assignments</h1>
        <AutoAssignButton />
      </div>

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
                          <span>{a.reviewer.email}</span>
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
