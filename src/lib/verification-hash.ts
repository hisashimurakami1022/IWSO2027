import { createHash } from "node:crypto";

// Reproduces @auth/core's own token hashing exactly (see
// node_modules/@auth/core/lib/utils/web.js createHash, and
// lib/actions/callback/index.js's `createHash(`${token}${secret}`)` call
// for the email provider) — SHA-256 hex digest of the raw token plus the
// Auth.js secret. Needed so completeSignInAction (src/app/verify-request
// /confirm/actions.ts) can look up the same VerificationToken row Auth.js
// itself would, without going through its HTTP callback route.
export function hashVerificationToken(rawToken: string, secret: string): string {
  return createHash("sha256").update(`${rawToken}${secret}`).digest("hex");
}
