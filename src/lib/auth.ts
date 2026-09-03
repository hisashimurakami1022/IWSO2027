import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { APP_URL } from "@/lib/app-url";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-request",
  },
  providers: [
    Resend({
      from: process.env.EMAIL_FROM,
      // Institutional email security systems (e.g. Microsoft Defender Safe
      // Links) fetch every link in an incoming email to scan it, before the
      // recipient ever opens it. Since the real Auth.js callback URL signs
      // in on the very first GET, that scan silently consumes the one-time
      // token — the user's own click then fails as "already used". Emailing
      // a link to our own no-op confirmation page instead, which requires a
      // real click to reach the actual callback, defeats that: scanners
      // fetch the confirmation page (harmless) but don't click buttons on
      // it, so the token survives for the real click.
      async sendVerificationRequest({ identifier: to, url, provider }) {
        const host = new URL(url).host;
        const confirmUrl = new URL("/verify-request/confirm", APP_URL);
        confirmUrl.searchParams.set("url", url);

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: provider.from,
            to,
            subject: `Sign in to ${host}`,
            html: `<body style="font-family: Helvetica, Arial, sans-serif; background: #f9f9f9; padding: 24px;">
  <table width="100%" cellpadding="0" cellspacing="20" style="background: #fff; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr><td align="center" style="font-size: 22px; color: #444;">Sign in to <strong>${host.replace(/\./g, "&#8203;.")}</strong></td></tr>
    <tr><td align="center" style="padding: 20px 0;">
      <a href="${confirmUrl.toString()}" target="_blank" style="font-size: 18px; color: #fff; text-decoration: none; border-radius: 5px; padding: 10px 20px; background: #346df1; display: inline-block; font-weight: bold;">Sign in</a>
    </td></tr>
    <tr><td align="center" style="font-size: 14px; color: #444;">If you did not request this email you can safely ignore it.</td></tr>
  </table>
</body>`,
            text: `Sign in to ${host}\n${confirmUrl.toString()}\n\nIf you did not request this email you can safely ignore it.`,
          }),
        });
        if (!res.ok) {
          throw new Error("Resend error: " + JSON.stringify(await res.json()));
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.roles = user.roles;
      session.user.affiliation = user.affiliation;
      return session;
    },
  },
});
