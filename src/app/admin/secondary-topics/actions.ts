"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireChair } from "@/lib/session";
import { reorderList } from "@/lib/reorder";

const secondaryTopicSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(20)
    .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, - or _ only"),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});

export type SecondaryTopicActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

export async function saveSecondaryTopicAction(
  prevState: SecondaryTopicActionState,
  formData: FormData
): Promise<SecondaryTopicActionState> {
  await requireChair();
  const id = (formData.get("id") as string) || null;

  const parsed = secondaryTopicSchema.safeParse({
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
      await prisma.secondaryTopic.update({ where: { id }, data });
    } else {
      await prisma.secondaryTopic.create({ data });
    }
  } catch {
    return { message: "A secondary topic with this code already exists." };
  }

  revalidatePath("/admin/secondary-topics");
  return { success: true };
}

export async function deleteSecondaryTopicAction(id: string) {
  await requireChair();
  const count = await prisma.submission.count({ where: { secondaryTopicId: id } });
  if (count > 0) {
    throw new Error("Cannot delete a secondary topic that has submissions.");
  }
  await prisma.secondaryTopic.delete({ where: { id } });
  revalidatePath("/admin/secondary-topics");
}

export async function reorderSecondaryTopicAction(id: string, direction: "up" | "down") {
  await requireChair();
  const secondaryTopics = await prisma.secondaryTopic.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
  const updates = reorderList(secondaryTopics, id, direction);
  if (!updates) return;
  await prisma.$transaction(
    updates.map((u) => prisma.secondaryTopic.update({ where: { id: u.id }, data: { order: u.order } }))
  );
  revalidatePath("/admin/secondary-topics");
}
