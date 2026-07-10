import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { SubmissionForm } from "@/components/submission-form";
import { WithdrawSubmissionButton } from "@/components/withdraw-submission-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SUBMISSION_STATUS_LABELS } from "@/lib/labels";

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
      include: { authors: { orderBy: { order: "asc" } } },
    }),
    prisma.track.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!submission || submission.submitterId !== user.id) {
    notFound();
  }

  const editable = submission.status === "DRAFT" || submission.status === "SUBMITTED";

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{submission.title}</h1>
          <Badge className="mt-2">{SUBMISSION_STATUS_LABELS[submission.status]}</Badge>
        </div>
        {editable && <WithdrawSubmissionButton id={submission.id} />}
      </div>

      {editable ? (
        <Card>
          <CardHeader>
            <CardTitle>投稿内容の編集</CardTitle>
          </CardHeader>
          <CardContent>
            <SubmissionForm
              tracks={tracks}
              defaultValues={{
                id: submission.id,
                title: submission.title,
                trackId: submission.trackId,
                presentationType: submission.presentationType,
                abstractText: submission.abstractText,
                keywords: submission.keywords,
                authors: submission.authors.map((a) => ({
                  name: a.name,
                  email: a.email,
                  affiliation: a.affiliation ?? "",
                  isCorresponding: a.isCorresponding,
                })),
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-4 py-6 text-sm">
            <p className="whitespace-pre-wrap">{submission.abstractText}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
