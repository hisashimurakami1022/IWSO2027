import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireChair } from "@/lib/session";
import {
  SUBMISSION_STATUS_LABELS,
  DECISION_LABELS,
  PRESENTATION_TYPE_LABELS,
  PRESENTATION_CATEGORY_LABELS,
  REVIEW_RATING_VALUES,
} from "@/lib/labels";
import { toCsv } from "@/lib/csv";
import type { SubmissionStatus } from "@/generated/prisma/client";

export async function GET(request: Request) {
  await requireChair();

  const status = new URL(request.url).searchParams.get("status") as SubmissionStatus | null;

  const submissions = await prisma.submission.findMany({
    where: status ? { status } : {},
    include: {
      track: true,
      materialSystem: true,
      primaryTopic: true,
      secondaryTopic: true,
      submitter: true,
      authors: { orderBy: { order: "asc" } },
      reviews: { where: { submittedAt: { not: null } }, select: { rating: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const rows: string[][] = [
    [
      "Submission ID",
      "Title",
      "Track",
      "Material System",
      "Primary Research Topic",
      "Secondary Research Topic",
      "Presentation Type",
      "Presentation Category",
      "Keywords",
      "Status",
      "Decision",
      "Total Rating",
      "Rated Reviews",
      "Submitter Email",
      "Author Names",
      "Author Emails",
      "Author Affiliations",
      "Corresponding Author",
      "Submitted At",
    ],
  ];

  for (const s of submissions) {
    const correspondingAuthor = s.authors.find((a) => a.isCorresponding);
    const ratedReviews = s.reviews
      .map((r) => (r.rating ? REVIEW_RATING_VALUES[r.rating] : undefined))
      .filter((v): v is number => typeof v === "number");
    const totalRating = ratedReviews.reduce((sum, v) => sum + v, 0);
    rows.push([
      s.submissionCode ?? "",
      s.title,
      s.track.name,
      s.materialSystem?.name ?? "",
      s.primaryTopic?.name ?? "",
      s.secondaryTopic?.name ?? "",
      PRESENTATION_TYPE_LABELS[s.presentationType],
      PRESENTATION_CATEGORY_LABELS[s.presentationCategory],
      s.keywords.join("; "),
      SUBMISSION_STATUS_LABELS[s.status],
      s.decision ? DECISION_LABELS[s.decision] : "",
      s.reviews.length > 0 ? String(totalRating) : "",
      `${ratedReviews.length}/${s.reviews.length}`,
      s.submitter.email,
      s.authors.map((a) => a.name).join("; "),
      s.authors.map((a) => a.email).join("; "),
      s.authors.map((a) => a.affiliation ?? "").join("; "),
      correspondingAuthor?.name ?? "",
      s.submittedAt ? format(s.submittedAt, "yyyy-MM-dd HH:mm") : "",
    ]);
  }

  const csv = toCsv(rows);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="submissions.csv"',
    },
  });
}
