import type {
  Decision,
  PresentationType,
  Role,
  SubmissionStatus,
} from "@/generated/prisma/client";

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  DECIDED: "Decided",
  WITHDRAWN: "Withdrawn",
};

export const DECISION_LABELS: Record<Decision, string> = {
  ACCEPT: "Accept",
  REJECT: "Reject",
};

export const PRESENTATION_TYPE_LABELS: Record<PresentationType, string> = {
  ORAL: "Oral Presentation",
  POSTER: "Poster Presentation",
};

export const ROLE_LABELS: Record<Role, string> = {
  REVIEWER: "Reviewer",
  CHAIR: "Chair",
};
