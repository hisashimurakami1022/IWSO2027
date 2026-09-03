import type {
  Decision,
  PresentationCategory,
  PresentationType,
  ProgramSessionType,
  ReviewRating,
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

export const REVIEW_RATING_LABELS: Record<ReviewRating, string> = {
  RECOMMENDED: "+1 (recommended)",
  NEUTRAL: "0 (neutral)",
  NOT_RECOMMENDED: "-1 (not recommended)",
  NOT_APPLICABLE: "NA (out of my research field)",
};

// Numeric value for averaging ratings; NOT_APPLICABLE is excluded (not 0).
export const REVIEW_RATING_VALUES: Partial<Record<ReviewRating, number>> = {
  RECOMMENDED: 1,
  NEUTRAL: 0,
  NOT_RECOMMENDED: -1,
};

export const PRESENTATION_TYPE_LABELS: Record<PresentationType, string> = {
  ORAL: "Oral Presentation",
  POSTER: "Poster Presentation",
};

export const PRESENTATION_CATEGORY_LABELS: Record<PresentationCategory, string> = {
  GENERAL: "General",
  INVITED: "Invited",
};

export const ROLE_LABELS: Record<Role, string> = {
  REVIEWER: "Reviewer",
  CHAIR: "Chair",
};

export const PROGRAM_SESSION_TYPE_LABELS: Record<ProgramSessionType, string> = {
  ORAL_SESSION: "Oral Session",
  POSTER_SESSION: "Poster Session",
  KEYNOTE: "Keynote",
  BREAK: "Break",
};
