"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireChair } from "@/lib/session";
import { reorderList } from "@/lib/reorder";

const materialSystemSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(20)
    .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, - or _ only"),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});

export type MaterialSystemActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

export async function saveMaterialSystemAction(
  prevState: MaterialSystemActionState,
  formData: FormData
): Promise<MaterialSystemActionState> {
  await requireChair();
  const id = (formData.get("id") as string) || null;

  const parsed = materialSystemSchema.safeParse({
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
      await prisma.materialSystem.update({ where: { id }, data });
    } else {
      await prisma.materialSystem.create({ data });
    }
  } catch {
    return { message: "A material system with this code already exists." };
  }

  revalidatePath("/admin/material-systems");
  return { success: true };
}

export async function deleteMaterialSystemAction(id: string) {
  await requireChair();
  const count = await prisma.submission.count({ where: { materialSystemId: id } });
  if (count > 0) {
    throw new Error("Cannot delete a material system that has submissions.");
  }
  await prisma.materialSystem.delete({ where: { id } });
  revalidatePath("/admin/material-systems");
}

export async function reorderMaterialSystemAction(id: string, direction: "up" | "down") {
  await requireChair();
  const materialSystems = await prisma.materialSystem.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
  const updates = reorderList(materialSystems, id, direction);
  if (!updates) return;
  await prisma.$transaction(
    updates.map((u) => prisma.materialSystem.update({ where: { id: u.id }, data: { order: u.order } }))
  );
  revalidatePath("/admin/material-systems");
}
