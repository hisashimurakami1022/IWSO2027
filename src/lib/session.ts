import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Role } from "@/generated/prisma/client";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(role: Role) {
  const user = await requireUser();
  if (!user.roles.includes(role) && !user.roles.includes("CHAIR")) {
    redirect("/dashboard");
  }
  return user;
}

export async function requireChair() {
  const user = await requireUser();
  if (!user.roles.includes("CHAIR")) redirect("/dashboard");
  return user;
}
