import type {
  Decision,
  PresentationType,
  Role,
  SubmissionStatus,
} from "@/generated/prisma/client";

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  DRAFT: "下書き",
  SUBMITTED: "投稿済み",
  UNDER_REVIEW: "査読中",
  DECIDED: "判定確定",
  WITHDRAWN: "取下げ",
};

export const DECISION_LABELS: Record<Decision, string> = {
  ACCEPT: "採択",
  REJECT: "不採択",
};

export const PRESENTATION_TYPE_LABELS: Record<PresentationType, string> = {
  ORAL: "口頭発表",
  POSTER: "ポスター発表",
};

export const ROLE_LABELS: Record<Role, string> = {
  REVIEWER: "査読者",
  CHAIR: "運営(Chair)",
};
