import { z } from "zod";

export const submissionAuthorSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email address"),
  affiliation: z.string().trim().max(200).optional().or(z.literal("")),
  isCorresponding: z.boolean(),
});

export const submissionSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  trackId: z.string().min(1, "Select a presentation category"),
  materialSystemId: z.string().min(1, "Select a material system"),
  primaryTopicId: z.string().min(1, "Select a primary research topic"),
  secondaryTopicId: z.string().optional().or(z.literal("")),
  presentationType: z.enum(["ORAL", "POSTER"]),
  presentationCategory: z.enum(["GENERAL", "INVITED"]),
  keywords: z.array(z.string().trim().min(1)).max(10),
  authors: z.array(submissionAuthorSchema).min(1, "At least one author is required"),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;

export const MAX_ABSTRACT_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ABSTRACT_FILE_MIME_TYPE = "application/pdf";
