import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { APP_URL } from "@/lib/app-url";

// Matches Auth.js's own database-session defaults exactly (see
// @auth/core/lib/utils/cookie.js defaultCookies() and lib/init.js), so a
// session created here is indistinguishable from one Auth.js created via
// the magic-link flow — same cookie name/attributes, same Session row shape.
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

function isSecureContext() {
  return APP_URL.startsWith("https://");
}

function sessionCookieName() {
  return `${isSecureContext() ? "__Secure-" : ""}authjs.session-token`;
}

export async function createDatabaseSession(userId: string) {
  const sessionToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await prisma.session.create({ data: { sessionToken, userId, expires } });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName(), sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: isSecureContext(),
    expires,
  });
}
