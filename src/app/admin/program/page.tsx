import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionFormDialog } from "./session-form-dialog";
import { DeleteSessionButton } from "./delete-session-button";
import { AssignSubmissionForm } from "./assign-submission-form";
import { RemoveSubmissionButton } from "./remove-submission-button";
import { PROGRAM_SESSION_TYPE_LABELS, PRESENTATION_CATEGORY_LABELS } from "@/lib/labels";
import { getConferenceSettings } from "@/lib/settings";
import { computeTalkSlots } from "@/lib/program-schedule";

function toLocalInput(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export default async function AdminProgramPage() {
  const [sessions, tracks, acceptedSubmissions, settings] = await Promise.all([
    prisma.programSession.findMany({
      include: {
        track: true,
        submissions: {
          include: { submission: true },
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.track.findMany({ orderBy: { name: "asc" } }),
    prisma.submission.findMany({
      where: { decision: "ACCEPT" },
      include: { programSessions: true },
      orderBy: { title: "asc" },
    }),
    getConferenceSettings(),
  ]);

  const assignedSubmissionIds = new Set(
    sessions.flatMap((s) => s.submissions.map((ps) => ps.submissionId))
  );
  const unassignedOptions = acceptedSubmissions
    .filter((s) => !assignedSubmissionIds.has(s.id))
    .map((s) => ({ id: s.id, title: s.title, keywords: s.keywords }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Program</h1>
          <p className="text-muted-foreground">
            Build the conference schedule from accepted submissions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href="/api/program/export">Export CSV</a>}
          />
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link href="/program" target="_blank" rel="noopener noreferrer">
                View Public Page
              </Link>
            }
          />
          <SessionFormDialog tracks={tracks} trigger={<Button>New Session</Button>} />
        </div>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No sessions yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const showSlots = session.type === "ORAL_SESSION";
            const slots = showSlots
              ? computeTalkSlots(
                  session.startTime,
                  session.submissions.map((ps) => ps.submission),
                  settings
                )
              : null;
            const lastSlot = slots ? Array.from(slots.values()).at(-1) : null;
            const overflowsSession = lastSlot ? lastSlot.end > session.endTime : false;

            return (
            <Card key={session.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                    {session.title}
                    <Badge variant="secondary">{PROGRAM_SESSION_TYPE_LABELS[session.type]}</Badge>
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {format(session.startTime, "MMM d, yyyy HH:mm")} &ndash;{" "}
                    {format(session.endTime, "HH:mm")}
                    {session.room && <> &middot; {session.room}</>}
                    {session.track && <> &middot; {session.track.name}</>}
                  </p>
                </div>
                <div className="flex gap-2">
                  <SessionFormDialog
                    tracks={tracks}
                    session={{
                      id: session.id,
                      title: session.title,
                      type: session.type,
                      room: session.room,
                      trackId: session.trackId,
                      startTime: toLocalInput(session.startTime),
                      endTime: toLocalInput(session.endTime),
                    }}
                    trigger={
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    }
                  />
                  <DeleteSessionButton id={session.id} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {session.submissions.length > 0 && (
                  <div className="space-y-1">
                    {session.submissions.map((ps) => {
                      const slot = slots?.get(ps.submissionId);
                      return (
                        <div key={ps.id} className="flex items-center justify-between text-sm">
                          <span className="flex flex-wrap items-center gap-2">
                            {slot && (
                              <span className="font-mono text-muted-foreground">
                                {format(slot.start, "HH:mm")}&ndash;{format(slot.end, "HH:mm")}
                              </span>
                            )}
                            {ps.submission.title}
                            <Badge variant="outline">
                              {PRESENTATION_CATEGORY_LABELS[ps.submission.presentationCategory]}
                            </Badge>
                          </span>
                          <RemoveSubmissionButton id={ps.id} />
                        </div>
                      );
                    })}
                    {overflowsSession && (
                      <p className="text-xs text-destructive">
                        These talks run past the session&apos;s end time ({format(session.endTime, "HH:mm")}).
                        Extend the session or move a talk elsewhere.
                      </p>
                    )}
                  </div>
                )}
                <AssignSubmissionForm sessionId={session.id} options={unassignedOptions} />
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
