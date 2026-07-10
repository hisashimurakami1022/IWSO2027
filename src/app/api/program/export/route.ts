import { prisma } from "@/lib/prisma";
import { requireChair } from "@/lib/session";
import { PROGRAM_SESSION_TYPE_LABELS } from "@/lib/labels";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  await requireChair();

  const sessions = await prisma.programSession.findMany({
    include: {
      track: true,
      submissions: {
        include: { submission: { include: { authors: true } } },
        orderBy: { orderIndex: "asc" },
      },
    },
    orderBy: { startTime: "asc" },
  });

  const rows: string[][] = [
    ["Session", "Type", "Room", "Start", "End", "Track", "Submission Title", "Authors"],
  ];

  for (const session of sessions) {
    if (session.submissions.length === 0) {
      rows.push([
        session.title,
        PROGRAM_SESSION_TYPE_LABELS[session.type],
        session.room ?? "",
        session.startTime.toISOString(),
        session.endTime.toISOString(),
        session.track?.name ?? "",
        "",
        "",
      ]);
      continue;
    }
    for (const ps of session.submissions) {
      rows.push([
        session.title,
        PROGRAM_SESSION_TYPE_LABELS[session.type],
        session.room ?? "",
        session.startTime.toISOString(),
        session.endTime.toISOString(),
        session.track?.name ?? "",
        ps.submission.title,
        ps.submission.authors.map((a) => a.name).join("; "),
      ]);
    }
  }

  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="program.csv"',
    },
  });
}
