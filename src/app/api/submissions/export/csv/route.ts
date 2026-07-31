import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireChair } from "@/lib/session";
import {
  SUBMISSION_STATUS_LABELS,
  DECISION_LABELS,
  PRESENTATION_TYPE_LABELS,
  PRESENTATION_CATEGORY_LABELS,
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
      submitter: true,
      authors: { orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  const rows: string[][] = [
    [
      "Title",
      "Track",
      "Presentation Type",
      "Presentation Category",
      "Keywords",
      "Status",
      "Decision",
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
    rows.push([
      s.title,
      s.track.name,
      PRESENTATION_TYPE_LABELS[s.presentationType],
      PRESENTATION_CATEGORY_LABELS[s.presentationCategory],
      s.keywords.join("; "),
      SUBMISSION_STATUS_LABELS[s.status],
      s.decision ? DECISION_LABELS[s.decision] : "",
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
