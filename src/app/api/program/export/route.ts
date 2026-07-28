import { prisma } from "@/lib/prisma";
import { requireChair } from "@/lib/session";
import { PROGRAM_SESSION_TYPE_LABELS, PRESENTATION_CATEGORY_LABELS } from "@/lib/labels";
import { getConferenceSettings } from "@/lib/settings";
import { computeTalkSlots } from "@/lib/program-schedule";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  await requireChair();

  const [sessions, settings] = await Promise.all([
    prisma.programSession.findMany({
      include: {
        track: true,
        submissions: {
          include: { submission: { include: { authors: true } } },
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: { startTime: "asc" },
    }),
    getConferenceSettings(),
  ]);

  const rows: string[][] = [
    [
      "Session",
      "Type",
      "Room",
      "Start",
      "End",
      "Track",
      "Submission Title",
      "Category",
      "Talk Start",
      "Talk End",
      "Authors",
    ],
  ];

  for (const session of sessions) {
    const slots =
      session.type === "ORAL_SESSION"
        ? computeTalkSlots(
            session.startTime,
            session.submissions.map((ps) => ps.submission),
            settings
          )
        : null;

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
        "",
        "",
        "",
      ]);
      continue;
    }
    for (const ps of session.submissions) {
      const slot = slots?.get(ps.submissionId);
      rows.push([
        session.title,
        PROGRAM_SESSION_TYPE_LABELS[session.type],
        session.room ?? "",
        session.startTime.toISOString(),
        session.endTime.toISOString(),
        session.track?.name ?? "",
        ps.submission.title,
        PRESENTATION_CATEGORY_LABELS[ps.submission.presentationCategory],
        slot ? slot.start.toISOString() : "",
        slot ? slot.end.toISOString() : "",
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
