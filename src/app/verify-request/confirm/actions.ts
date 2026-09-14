"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createDatabaseSession } from "@/lib/password-session";
import { hashVerificationToken } from "@/lib/verification-hash";

// The only place a SignInRequest (see src/lib/auth.ts) is ever consumed —
// reachable solely via the confirmation page's form submit, i.e. a real
// click, not a mail scanner's GET prefetch of that page.
export async function completeSignInAction(formData: FormData) {
  const ref = (formData.get("ref") as string) || "";

  const pending = ref ? await prisma.signInRequest.findUnique({ where: { ref } }) : null;
  // Single-use regardless of what happens below, so a ref can never be
  // replayed once someone has acted on it.
  if (pending) {
    await prisma.signInRequest.delete({ where: { ref } }).catch(() => {});
  }
  if (!pending || pending.expires < new Date()) {
    redirect("/login?error=verification_failed");
  }

  const callback = new URL(pending.callbackUrl);
  const rawToken = callback.searchParams.get("token");
  const email = callback.searchParams.get("email");
  const secret = process.env.AUTH_SECRET;
  if (!rawToken || !email || !secret) {
    redirect("/login?error=verification_failed");
  }

  // Reproduces exactly what Auth.js's own email callback does: look up and
  // delete the matching VerificationToken row (see
  // @auth/core/lib/actions/callback/index.js and
  // @auth/prisma-adapter's useVerificationToken).
  const hashedToken = hashVerificationToken(rawToken, secret);
  let verification;
  try {
    verification = await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token: hashedToken } },
    });
  } catch {
    verification = null; // already used, or never existed
  }
  if (!verification || verification.expires < new Date()) {
    redirect("/login?error=verification_failed");
  }

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email, emailVerified: new Date() } });
  }

  await createDatabaseSession(user.id);
  redirect("/dashboard");
}
