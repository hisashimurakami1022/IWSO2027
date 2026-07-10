import { z } from "zod";

export const submissionAuthorSchema = z.object({
  name: z.string().trim().min(1, "氏名を入力してください").max(100),
  email: z.string().trim().email("有効なメールアドレスを入力してください"),
  affiliation: z.string().trim().max(200).optional().or(z.literal("")),
  isCorresponding: z.boolean(),
});

export const submissionSchema = z.object({
  title: z.string().trim().min(1, "タイトルを入力してください").max(300),
  trackId: z.string().min(1, "トラックを選択してください"),
  presentationType: z.enum(["ORAL", "POSTER"]),
  abstractText: z.string().trim().min(1, "Abstract本文を入力してください").max(5000),
  keywords: z.array(z.string().trim().min(1)).max(10),
  authors: z.array(submissionAuthorSchema).min(1, "著者を1名以上入力してください"),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
