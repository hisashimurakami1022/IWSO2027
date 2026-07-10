import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SUBMISSION_STATUS_LABELS } from "@/lib/labels";
import type { SubmissionStatus } from "@/generated/prisma/client";

export default async function AdminOverviewPage() {
  const [total, byStatus, trackCount, reviewerCount] = await Promise.all([
    prisma.submission.count(),
    prisma.submission.groupBy({ by: ["status"], _count: true }),
    prisma.track.count(),
    prisma.user.count({ where: { roles: { has: "REVIEWER" } } }),
  ]);

  const statusCounts = Object.fromEntries(
    byStatus.map((s) => [s.status, s._count])
  ) as Record<SubmissionStatus, number>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Overview</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Submissions" value={total} />
        {Object.entries(SUBMISSION_STATUS_LABELS).map(([key, label]) => (
          <StatCard key={key} label={label} value={statusCounts[key as SubmissionStatus] ?? 0} />
        ))}
        <StatCard label="Tracks" value={trackCount} />
        <StatCard label="Reviewers" value={reviewerCount} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="text-3xl font-bold">{value}</CardContent>
    </Card>
  );
}
