import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  SUBMISSION_STATUS_LABELS,
  PRESENTATION_TYPE_LABELS,
  PRESENTATION_CATEGORY_LABELS,
  DECISION_LABELS,
  REVIEW_RATING_LABELS,
  REVIEW_RATING_VALUES,
} from "@/lib/labels";
import { DecisionButtons } from "./decision-buttons";
import { DeleteSubmissionButton } from "./delete-submission-button";
import { PresentationCategorySelect } from "./presentation-category-select";

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
      materialSystem: true,
      primaryTopic: true,
      secondaryTopic: true,
      submitter: true,
      authors: { orderBy: { order: "asc" } },
      file: true,
      reviewAssignments: { include: { reviewer: true, review: true } },
    },
  });

  if (!submission) {
    notFound();
  }

  // NOT_APPLICABLE ratings are excluded from the average (no numeric value),
  // not just unsubmitted reviews.
  const ratingValues = submission.reviewAssignments
    .map((a) => (a.review?.rating ? REVIEW_RATING_VALUES[a.review.rating] : undefined))
    .filter((v): v is number => typeof v === "number");
  const averageRating =
    ratingValues.length > 0
      ? (ratingValues.reduce((sum, v) => sum + v, 0) / ratingValues.length).toFixed(1)
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
          <span>{PRESENTATION_CATEGORY_LABELS[submission.presentationCategory]}</span>
          {submission.materialSystem && (
            <>
              <span>&middot;</span>
              <span>{submission.materialSystem.name}</span>
            </>
          )}
          {submission.primaryTopic && (
            <>
              <span>&middot;</span>
              <span>
                {submission.primaryTopic.name}
                {submission.secondaryTopic && ` / ${submission.secondaryTopic.name}`}
              </span>
            </>
          )}
          <span>&middot;</span>
          <span>Submitted by {submission.submitter.email}</span>
          {averageRating && (
            <>
              <span>&middot;</span>
              <span>Avg. rating {averageRating}</span>
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
                  a.review.rating && (
                    <Badge>{REVIEW_RATING_LABELS[a.review.rating]}</Badge>
                  )
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

      <Card>
        <CardHeader>
          <CardTitle>Program</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <PresentationCategorySelect
            submissionId={submission.id}
            value={submission.presentationCategory}
          />
          <p className="text-sm text-muted-foreground">
            Determines the talk length used to auto-schedule this submission when it&apos;s
            assigned to a program session (durations are set on the Settings page).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DeleteSubmissionButton submissionId={submission.id} />
          <p className="text-sm text-muted-foreground">
            Permanently deletes this submission and all related data (abstract file, authors,
            review assignments, reviews). Use this to remove test/dummy submissions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
