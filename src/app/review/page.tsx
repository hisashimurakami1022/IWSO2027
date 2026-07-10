import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function ReviewQueuePage() {
  const user = await requireUser();

  const assignments = await prisma.reviewAssignment.findMany({
    where: { reviewerId: user.id },
    include: {
      submission: { include: { track: true } },
      review: true,
    },
    orderBy: { assignedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Review Queue</h1>
        <p className="text-muted-foreground">Submissions assigned to you for review.</p>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No submissions assigned to you yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0 space-y-1">
                  <Link
                    href={`/review/${a.submissionId}`}
                    className="font-medium hover:underline"
                  >
                    {a.submission.title}
                  </Link>
                  <div className="text-sm text-muted-foreground">{a.submission.track.name}</div>
                </div>
                <Badge variant={a.review?.submittedAt ? "default" : "outline"}>
                  {a.review?.submittedAt ? "Reviewed" : "Pending"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
