import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireChair } from "@/lib/session";
import { PROGRAM_SESSION_TYPE_LABELS } from "@/lib/labels";
import { getConferenceSettings } from "@/lib/settings";
import { computeTalkSlots, type TalkSlot } from "@/lib/program-schedule";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatTalkTime(slot: TalkSlot | undefined) {
  if (!slot) return "";
  return `${format(slot.start, "HH:mm")}-${format(slot.end, "HH:mm")}`;
}

export async function GET() {
  await requireChair();

  const [sessions, settings] = await Promise.all([
    prisma.programSession.findMany({
      include: {
        submissions: {
          include: {
            submission: { include: { authors: { orderBy: { order: "asc" } } } },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: { startTime: "asc" },
    }),
    getConferenceSettings(),
  ]);

  const rows: string[][] = [
    ["Session", "Type", "Room", "Submission Title", "Talk Time", "Authors", "Affiliations"],
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
      rows.push([session.title, PROGRAM_SESSION_TYPE_LABELS[session.type], session.room ?? "", "", "", "", ""]);
      continue;
    }
    for (const ps of session.submissions) {
      rows.push([
        session.title,
        PROGRAM_SESSION_TYPE_LABELS[session.type],
        session.room ?? "",
        ps.submission.title,
        formatTalkTime(slots?.get(ps.submissionId)),
        ps.submission.authors.map((a) => a.name).join("; "),
        ps.submission.authors.map((a) => a.affiliation ?? "").join("; "),
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
