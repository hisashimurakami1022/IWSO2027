"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireChair } from "@/lib/session";
import type { Role } from "@/generated/prisma/client";

export async function toggleRoleAction(userId: string, role: Role, enabled: boolean) {
  const actor = await requireChair();
  if (actor.id === userId && role === "CHAIR" && !enabled) {
    throw new Error("You cannot remove your own Chair role.");
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const roles = new Set(user.roles);
  if (enabled) {
    roles.add(role);
  } else {
    roles.delete(role);
  }

  await prisma.user.update({ where: { id: userId }, data: { roles: Array.from(roles) } });
  revalidatePath("/admin/users");
}

export type InviteUserActionState = {
  message?: string;
  success?: boolean;
};

export async function inviteUserAction(
  prevState: InviteUserActionState,
  formData: FormData
): Promise<InviteUserActionState> {
  await requireChair();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const role = formData.get("role") as Role;

  if (!email || !email.includes("@")) {
    return { message: "Enter a valid email address." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const roles = new Set(existing.roles);
    roles.add(role);
    await prisma.user.update({ where: { id: existing.id }, data: { roles: Array.from(roles) } });
  } else {
    await prisma.user.create({ data: { email, roles: [role] } });
  }

  revalidatePath("/admin/users");
  return { success: true };
}
