import { z } from "zod";

export const submissionAuthorSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email address"),
  affiliation: z.string().trim().max(200).optional().or(z.literal("")),
  isCorresponding: z.boolean(),
});

export const submissionSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  trackId: z.string().min(1, "Select a track"),
  presentationType: z.enum(["ORAL", "POSTER"]),
  abstractText: z.string().trim().min(1, "Abstract is required").max(5000),
  keywords: z.array(z.string().trim().min(1)).max(10),
  authors: z.array(submissionAuthorSchema).min(1, "At least one author is required"),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
