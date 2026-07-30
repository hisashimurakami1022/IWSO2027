import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { SubmissionForm } from "@/components/submission-form";
import { WithdrawSubmissionButton } from "@/components/withdraw-submission-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SUBMISSION_STATUS_LABELS, DECISION_LABELS } from "@/lib/labels";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const [submission, tracks] = await Promise.all([
    prisma.submission.findUnique({
      where: { id },
      include: {
        authors: { orderBy: { order: "asc" } },
        file: true,
        reviews: true,
      },
    }),
    prisma.track.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!submission || submission.submitterId !== user.id) {
    notFound();
  }

  const editable = submission.status === "DRAFT" || submission.status === "SUBMITTED";
  const canWithdraw = submission.status !== "DECIDED" && submission.status !== "WITHDRAWN";

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{submission.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>{SUBMISSION_STATUS_LABELS[submission.status]}</Badge>
            {submission.decision && (
              <Badge variant={submission.decision === "ACCEPT" ? "default" : "destructive"}>
                {DECISION_LABELS[submission.decision]}
              </Badge>
            )}
          </div>
        </div>
        {canWithdraw && <WithdrawSubmissionButton id={submission.id} />}
      </div>

      {editable ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Submission</CardTitle>
          </CardHeader>
          <CardContent>
            <SubmissionForm
              tracks={tracks}
              defaultValues={{
                id: submission.id,
                title: submission.title,
                trackId: submission.trackId,
                presentationType: submission.presentationType,
                keywords: submission.keywords,
                authors: submission.authors.map((a) => ({
                  name: a.name,
                  email: a.email,
                  affiliation: a.affiliation ?? "",
                  isCorresponding: a.isCorresponding,
                })),
                existingFileName: submission.file?.fileName ?? null,
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-4 py-6 text-sm">
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
            {submission.status === "DECIDED" && (
              <div className="space-y-2 border-t pt-4">
                {submission.reviews
                  .map((r) => r.commentsForAuthor)
                  .filter((c): c is string => !!c && c.trim().length > 0)
                  .map((c, i) => (
                    <p key={i} className="whitespace-pre-wrap text-muted-foreground">
                      {c}
                    </p>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
