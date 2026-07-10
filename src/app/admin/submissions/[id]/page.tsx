import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SUBMISSION_STATUS_LABELS, PRESENTATION_TYPE_LABELS, DECISION_LABELS } from "@/lib/labels";
import { DecisionButtons } from "./decision-buttons";

export default async function AdminSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      track: true,
      submitter: true,
      authors: { orderBy: { order: "asc" } },
      file: true,
      reviewAssignments: { include: { reviewer: true, review: true } },
    },
  });

  if (!submission) {
    notFound();
  }

  const submittedScores = submission.reviewAssignments
    .map((a) => a.review?.score)
    .filter((s): s is number => typeof s === "number");
  const averageScore =
    submittedScores.length > 0
      ? (submittedScores.reduce((sum, s) => sum + s, 0) / submittedScores.length).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{submission.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge>{SUBMISSION_STATUS_LABELS[submission.status]}</Badge>
          {submission.decision && (
            <Badge variant={submission.decision === "ACCEPT" ? "default" : "destructive"}>
              {DECISION_LABELS[submission.decision]}
            </Badge>
          )}
          <span>{submission.track.name}</span>
          <span>&middot;</span>
          <span>{PRESENTATION_TYPE_LABELS[submission.presentationType]}</span>
          <span>&middot;</span>
          <span>Submitted by {submission.submitter.email}</span>
          {averageScore && (
            <>
              <span>&middot;</span>
              <span>Avg. score {averageScore}</span>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Abstract</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {submission.file ? (
            <a
              href={`/api/submissions/${submission.id}/file`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              {submission.file.fileName}
            </a>
          ) : (
            <p className="text-muted-foreground">No abstract file uploaded.</p>
          )}
        </CardContent>
      </Card>

      {submission.keywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Keywords</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {submission.keywords.map((k) => (
              <Badge key={k} variant="secondary">
                {k}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Authors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {submission.authors.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{a.name}</span>
              <span className="text-muted-foreground">{a.email}</span>
              {a.affiliation && <span className="text-muted-foreground">({a.affiliation})</span>}
              {a.isCorresponding && <Badge variant="outline">Corresponding</Badge>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {submission.reviewAssignments.length === 0 && (
            <p className="text-muted-foreground">No reviewers assigned yet.</p>
          )}
          {submission.reviewAssignments.map((a) => (
            <div key={a.id} className="space-y-1 rounded-md border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{a.reviewer.email}</span>
                {a.review?.submittedAt ? (
                  <>
                    <Badge>Score: {a.review.score}</Badge>
                    {a.review.recommendation && (
                      <Badge variant="secondary">
                        {DECISION_LABELS[a.review.recommendation]}
                      </Badge>
                    )}
                  </>
                ) : (
                  <Badge variant="outline">Pending</Badge>
                )}
              </div>
              {a.review?.commentsForAuthor && (
                <p className="whitespace-pre-wrap text-muted-foreground">
                  <span className="font-medium text-foreground">For author: </span>
                  {a.review.commentsForAuthor}
                </p>
              )}
              {a.review?.commentsForChair && (
                <p className="whitespace-pre-wrap text-muted-foreground">
                  <span className="font-medium text-foreground">Confidential: </span>
                  {a.review.commentsForChair}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Decision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DecisionButtons submissionId={submission.id} currentDecision={submission.decision} />
          <p className="text-sm text-muted-foreground">
            Setting a decision moves this submission to &quot;Decided&quot;. Send the notification
            email from the Decisions page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
