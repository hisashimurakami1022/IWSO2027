# IWSO 2027 Submission System

Abstract submission, peer review, decision, and program-scheduling system for the IWSO 2027 international conference (May 2027).

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [Prisma 6](https://www.prisma.io) + PostgreSQL
- [Auth.js v5](https://authjs.dev) — email magic-link sign-in via [Resend](https://resend.com)
- [shadcn/ui](https://ui.shadcn.com) (base-ui variant) + Tailwind CSS v4

## Roles

- **Author** (any signed-in user) — submit an abstract (PDF) with title/authors/affiliations as text, edit or withdraw until the submission deadline, view decision once made.
- **Reviewer** — see only the submissions assigned to them, score (1-5), recommend Accept/Reject, leave comments for the author and confidential notes for the chair.
- **Chair** (admin) — manage tracks, deadlines, users/roles, assign reviewers (manual or auto), finalize decisions, send notifications, and build the program.

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in the values (see below).
3. Apply the database schema:
   ```bash
   npx prisma migrate deploy
   ```
4. Seed the initial conference settings, a default track, and a Chair account:
   ```bash
   npx prisma db seed
   ```
   Edit `prisma/seed.ts` to change the seeded Chair email before running.
5. Start the dev server:
   ```bash
   npm run dev
   ```

### Environment variables

See `.env.example`. You will need:

- `DATABASE_URL` — a PostgreSQL connection string (Neon recommended for production).
- `AUTH_SECRET` — random secret for Auth.js session signing.
- `AUTH_RESEND_KEY` — Resend API key, used for both magic-link sign-in and all notification emails.
- `EMAIL_FROM` — sender address. The Resend sandbox address (`onboarding@resend.dev`) only delivers to the email you signed up to Resend with; verify a custom domain in Resend to send to real recipients.
- `NEXT_PUBLIC_APP_URL` / `AUTH_URL` — the app's public URL.

## Deploying

1. **Database**: create a production PostgreSQL database (e.g. on [Neon](https://neon.tech)) and set `DATABASE_URL`. Run `npx prisma migrate deploy` against it, then `npx prisma db seed` to bootstrap the initial Chair account, default track, and conference settings.
2. **Email**: create a [Resend](https://resend.com) account, verify your sending domain, and set `AUTH_RESEND_KEY` / `EMAIL_FROM` accordingly.
3. **App**: deploy to [Vercel](https://vercel.com) (or any Next.js host) with the environment variables above configured. Update `AUTH_URL` / `NEXT_PUBLIC_APP_URL` to the production URL. To self-host instead (e.g. on a Sakura VPS), see [DEPLOY.md](./DEPLOY.md) — the app has no Vercel-specific dependencies.
4. Once deployed, sign in as the seeded Chair account and use **Admin → Users** to grant Reviewer/Chair access to other organizers and reviewers, **Admin → Tracks** to set up real tracks, and **Admin → Settings** to set the actual conference deadlines.

## Notable implementation notes

- Abstract files (PDF) are stored as bytes directly in Postgres rather than a separate blob store, since file sizes are expected to stay small at this conference's scale.
- All notification emails (submission confirmation, reviewer assignment, review reminders, decisions) are sent best-effort — a failed send is logged to the console but never blocks the underlying action.
- The public program page (`/program`) requires no authentication; everything else requires sign-in, with `/admin/*` restricted to Chair and `/review/*` restricted to Reviewer/Chair.
