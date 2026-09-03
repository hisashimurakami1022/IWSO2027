"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireChair } from "@/lib/session";

const researchTopicSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(20)
    .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, - or _ only"),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});

export type ResearchTopicActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

export async function saveResearchTopicAction(
  prevState: ResearchTopicActionState,
  formData: FormData
): Promise<ResearchTopicActionState> {
  await requireChair();
  const id = (formData.get("id") as string) || null;

  const parsed = researchTopicSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const data = {
    name: parsed.data.name,
    code: parsed.data.code.toUpperCase(),
    description: parsed.data.description || null,
  };

  try {
    if (id) {
      await prisma.researchTopic.update({ where: { id }, data });
    } else {
      await prisma.researchTopic.create({ data });
    }
  } catch {
    return { message: "A research topic with this code already exists." };
  }

  revalidatePath("/admin/research-topics");
  return { success: true };
}

export async function deleteResearchTopicAction(id: string) {
  await requireChair();
  const [primaryCount, secondaryCount] = await Promise.all([
    prisma.submission.count({ where: { primaryTopicId: id } }),
    prisma.submission.count({ where: { secondaryTopicId: id } }),
  ]);
  if (primaryCount > 0 || secondaryCount > 0) {
    throw new Error("Cannot delete a research topic that has submissions.");
  }
  await prisma.researchTopic.delete({ where: { id } });
  revalidatePath("/admin/research-topics");
}
