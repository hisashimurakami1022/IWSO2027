import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PRESENTATION_TYPE_LABELS } from "@/lib/labels";
import { ReviewForm } from "./review-form";

export default async function ReviewSubmissionPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = await params;
  const user = await requireUser();

  const assignment = await prisma.reviewAssignment.findUnique({
    where: { submissionId_reviewerId: { submissionId, reviewerId: user.id } },
    include: {
      submission: {
        include: {
          track: true,
          authors: { orderBy: { order: "asc" } },
          file: true,
        },
      },
      review: true,
    },
  });

  if (!assignment) {
    notFound();
  }

  const { submission, review } = assignment;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">{submission.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{submission.track.name}</span>
          <span>&middot;</span>
          <span>{PRESENTATION_TYPE_LABELS[submission.presentationType]}</span>
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
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Review</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewForm
            submissionId={submission.id}
            defaultValues={
              review ? { score: review.score, recommendation: review.recommendation } : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
