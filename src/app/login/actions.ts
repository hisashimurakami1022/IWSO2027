"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createDatabaseSession } from "@/lib/password-session";

// nginx is the only public entry point (see deploy/nginx.conf.example / DEPLOY.md),
// so the last hop it appends to X-Forwarded-For is the real client IP. Earlier,
// comma-separated values are client-supplied and not trustworthy.
async function getClientIp() {
  const forwardedFor = (await headers()).get("x-forwarded-for");
  const parts = forwardedFor?.split(",").map((p) => p.trim()).filter(Boolean) ?? [];
  return parts.at(-1) ?? "unknown";
}

export async function loginWithLinkAction(formData: FormData) {
  const email = (formData.get("email") as string).trim().toLowerCase();
  const callbackUrl = formData.get("callbackUrl") as string;
  const ip = await getClientIp();

  // 1 email per address per minute, 5 attempts per IP per 10 minutes — stops
  // one submitter from spamming an unrelated address, or one source from
  // spraying sign-in emails at many addresses.
  const emailOk = checkRateLimit(`login:email:${email}`, 1, 60 * 1000);
  const ipOk = checkRateLimit(`login:ip:${ip}`, 5, 10 * 60 * 1000);

  if (!emailOk || !ipOk) {
    const params = new URLSearchParams({ error: "rate_limited" });
    if (callbackUrl) params.set("callbackUrl", callbackUrl);
    redirect(`/login?${params.toString()}`);
  }

  await signIn("resend", {
    email,
    redirectTo: callbackUrl || "/dashboard",
  });
}

export type PasswordLoginState = { error?: string };

export async function loginWithPasswordAction(
  prevState: PasswordLoginState,
  formData: FormData
): Promise<PasswordLoginState> {
  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard";
  const ip = await getClientIp();

  // Looser than the magic-link limits (these don't send email), but still
  // enough to slow down password guessing: 5 tries per address per 15
  // minutes, 20 per source IP per 15 minutes.
  const emailOk = checkRateLimit(`login-pw:email:${email}`, 5, 15 * 60 * 1000);
  const ipOk = checkRateLimit(`login-pw:ip:${ip}`, 20, 15 * 60 * 1000);
  if (!emailOk || !ipOk) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const genericError = "Incorrect email or password.";
  if (!user?.passwordHash) {
    return { error: genericError };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: genericError };
  }

  await createDatabaseSession(user.id);
  redirect(callbackUrl);
}
