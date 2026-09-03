import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  SUBMISSION_STATUS_LABELS,
  PRESENTATION_TYPE_LABELS,
  REVIEW_RATING_VALUES,
} from "@/lib/labels";
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
  searchParams: Promise<{ status?: string; sort?: string }>;
}) {
  const { status, sort } = await searchParams;

  const rows = await prisma.submission.findMany({
    where: status ? { status: status as SubmissionStatus } : {},
    include: {
      track: true,
      submitter: true,
      reviews: { where: { submittedAt: { not: null } }, select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const submissions = rows.map((s) => {
    const ratedReviews = s.reviews
      .map((r) => (r.rating ? REVIEW_RATING_VALUES[r.rating] : undefined))
      .filter((v): v is number => typeof v === "number");
    return {
      ...s,
      totalRating: ratedReviews.reduce((sum, v) => sum + v, 0),
      ratedReviewCount: ratedReviews.length,
      reviewCount: s.reviews.length,
    };
  });

  if (sort === "rating") {
    submissions.sort((a, b) => b.totalRating - a.totalRating);
  }

  const exportQuery = status ? `?status=${status}` : "";
  const sortQuery = new URLSearchParams({ ...(status ? { status } : {}), sort: "rating" }).toString();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Submissions</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href={`/api/submissions/export/pdfs${exportQuery}`}>Download PDFs (ZIP)</a>}
          />
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href={`/api/submissions/export/csv${exportQuery}`}>Export CSV</a>}
          />
        </div>
      </div>

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
              <TableHead>
                {sort === "rating" ? (
                  <Link
                    href={`/admin/submissions${status ? `?status=${status}` : ""}`}
                    className="hover:underline"
                  >
                    Rating &darr;
                  </Link>
                ) : (
                  <Link href={`/admin/submissions?${sortQuery}`} className="hover:underline">
                    Rating
                  </Link>
                )}
              </TableHead>
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
                <TableCell>
                  {s.reviewCount > 0 ? (
                    <span className="flex items-center gap-1.5">
                      <span className="font-mono font-medium">
                        {s.totalRating > 0 ? `+${s.totalRating}` : s.totalRating}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({s.ratedReviewCount}/{s.reviewCount} rated)
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {submissions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
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
