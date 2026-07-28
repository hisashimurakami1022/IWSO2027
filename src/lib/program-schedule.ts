import type { PresentationCategory } from "@/generated/prisma/client";

export type TalkDurations = {
  generalTalkMinutes: number;
  invitedTalkMinutes: number;
};

export type TalkSlot = { start: Date; end: Date };

/**
 * Lays out submissions back-to-back starting at the session's start time,
 * one slot per submission in order, sized by presentation category.
 */
export function computeTalkSlots<T extends { id: string; presentationCategory: PresentationCategory }>(
  sessionStart: Date,
  orderedSubmissions: T[],
  durations: TalkDurations
): Map<string, TalkSlot> {
  const slots = new Map<string, TalkSlot>();
  let cursor = sessionStart;

  for (const submission of orderedSubmissions) {
    const minutes =
      submission.presentationCategory === "INVITED"
        ? durations.invitedTalkMinutes
        : durations.generalTalkMinutes;
    const end = new Date(cursor.getTime() + minutes * 60 * 1000);
    slots.set(submission.id, { start: cursor, end });
    cursor = end;
  }

  return slots;
}
