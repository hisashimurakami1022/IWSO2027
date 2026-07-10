import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SUBMISSION_STATUS_LABELS, PRESENTATION_TYPE_LABELS } from "@/lib/labels";
import type { SubmissionStatus } from "@/generated/prisma/client";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  DRAFT: "outline",
  SUBMITTED: "secondary",
  UNDER_REVIEW: "secondary",
  DECIDED: "default",
  WITHDRAWN: "destructive",
};

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const submissions = await prisma.submission.findMany({
    where: status ? { status: status as SubmissionStatus } : {},
    include: { track: true, submitter: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Submissions</h1>

      <div className="flex flex-wrap gap-2 text-sm">
        <FilterLink label="All" href="/admin/submissions" active={!status} />
        {Object.entries(SUBMISSION_STATUS_LABELS).map(([key, label]) => (
          <FilterLink
            key={key}
            label={label}
            href={`/admin/submissions?status=${key}`}
            active={status === key}
          />
        ))}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Submitter</TableHead>
              <TableHead>Track</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <Link href={`/admin/submissions/${s.id}`} className="font-medium hover:underline">
                    {s.title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{s.submitter.email}</TableCell>
                <TableCell>{s.track.name}</TableCell>
                <TableCell>{PRESENTATION_TYPE_LABELS[s.presentationType]}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[s.status]}>
                    {SUBMISSION_STATUS_LABELS[s.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {submissions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No submissions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function FilterLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 ${
        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
