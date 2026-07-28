import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PROGRAM_SESSION_TYPE_LABELS } from "@/lib/labels";
import { getConferenceSettings } from "@/lib/settings";
import { computeTalkSlots } from "@/lib/program-schedule";

export default async function PublicProgramPage() {
  const [sessions, settings] = await Promise.all([
    prisma.programSession.findMany({
      include: {
        track: true,
        submissions: {
          include: { submission: { include: { authors: { orderBy: { order: "asc" } } } } },
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: { startTime: "asc" },
    }),
    getConferenceSettings(),
  ]);

  const sessionsByDay = new Map<string, typeof sessions>();
  for (const session of sessions) {
    const day = format(session.startTime, "yyyy-MM-dd");
    const existing = sessionsByDay.get(day) ?? [];
    existing.push(session);
    sessionsByDay.set(day, existing);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Program</h1>
        <p className="text-muted-foreground">IWSO 2027 conference schedule.</p>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            The program has not been published yet.
          </CardContent>
        </Card>
      ) : (
        Array.from(sessionsByDay.entries()).map(([day, daySessions]) => (
          <div key={day} className="space-y-4">
            <h2 className="text-lg font-semibold">{format(new Date(day), "EEEE, MMMM d, yyyy")}</h2>
            <div className="space-y-3">
              {daySessions.map((session) => {
                const slots =
                  session.type === "ORAL_SESSION"
                    ? computeTalkSlots(
                        session.startTime,
                        session.submissions.map((ps) => ps.submission),
                        settings
                      )
                    : null;

                return (
                  <Card key={session.id}>
                    <CardHeader>
                      <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                        {session.title}
                        <Badge variant="secondary">
                          {PROGRAM_SESSION_TYPE_LABELS[session.type]}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {format(session.startTime, "HH:mm")} &ndash;{" "}
                        {format(session.endTime, "HH:mm")}
                        {session.room && <> &middot; {session.room}</>}
                        {session.track && <> &middot; {session.track.name}</>}
                      </p>
                    </CardHeader>
                    {session.submissions.length > 0 && (
                      <CardContent className="space-y-2 text-sm">
                        {session.submissions.map((ps) => {
                          const slot = slots?.get(ps.submissionId);
                          return (
                            <div key={ps.id}>
                              <p className="font-medium">
                                {slot && (
                                  <span className="mr-2 font-mono text-muted-foreground">
                                    {format(slot.start, "HH:mm")}&ndash;{format(slot.end, "HH:mm")}
                                  </span>
                                )}
                                {ps.submission.title}
                              </p>
                              <p className="text-muted-foreground">
                                {ps.submission.authors.map((a) => a.name).join(", ")}
                              </p>
                            </div>
                          );
                        })}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
