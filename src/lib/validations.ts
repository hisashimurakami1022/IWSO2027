import { z } from "zod";

export const submissionAuthorSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  // Optional for co-authors; the presenter's email is required (checked
  // in submissionSchema's superRefine). If given, it must be well-formed.
  email: z.literal("").or(z.string().trim().email("Enter a valid email address")),
  affiliationIndexes: z.array(z.number().int().positive()).default([]),
  isPresenter: z.boolean(),
});

export const submissionSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(300),
    trackId: z.string().min(1, "Select a presentation category"),
    materialSystemId: z.string().min(1, "Select a material system"),
    primaryTopicId: z.string().min(1, "Select a primary research topic"),
    secondaryTopicId: z.string().optional().or(z.literal("")),
    presentationType: z.enum(["ORAL", "POSTER"]),
    presentationCategory: z.enum(["GENERAL", "INVITED"]),
    keywords: z.array(z.string().trim().min(1)).max(10),
    affiliations: z
      .array(z.string().trim().min(1, "Affiliation cannot be empty").max(200))
      .max(20, "At most 20 affiliations")
      .default([]),
    authors: z.array(submissionAuthorSchema).min(1, "At least one author is required"),
    // Student Award — all optional. Only persisted for Student Award tracks.
    studentAwardApplied: z.boolean(),
    supervisorName: z.string().trim().max(100).optional().or(z.literal("")),
    supervisorEmail: z
      .literal("")
      .or(z.string().trim().email("Enter a valid supervisor email address")),
  })
  .superRefine((val, ctx) => {
    const hasBadAffiliationRef = val.authors.some((a) =>
      a.affiliationIndexes.some((idx) => idx > val.affiliations.length)
    );
    if (hasBadAffiliationRef) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["authors"],
        message: "An author references an affiliation number that no longer exists.",
      });
    }

    const presenters = val.authors.filter((a) => a.isPresenter);
    if (presenters.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["authors"],
        message: "Tick “Presenter” for the author who will present.",
      });
    }
    if (presenters.some((a) => a.email.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["authors"],
        message: "The presenter's email address is required.",
      });
    }
  });

export type SubmissionInput = z.infer<typeof submissionSchema>;

export const MAX_ABSTRACT_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ABSTRACT_FILE_MIME_TYPE = "application/pdf";
