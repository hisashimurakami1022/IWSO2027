# IWSO 2027 — Chair Guide

This guide covers the full conference administration workflow: tracks, reviewer assignment, decisions, notifications, and program building.

## 1. Signing in

Sign in the same way as everyone else — enter your email on the sign-in page and click the link sent to you. Your account shows the **Admin** link in the top menu because it has the Chair role.

## 2. Admin Overview (`/admin`)

A dashboard showing total submissions, a breakdown by status (Draft / Submitted / Under Review / Decided / Withdrawn), track count, and reviewer count. Useful as an at-a-glance check; it doesn't require any action.

## 3. Initial setup

Before submissions open, set up:

### Tracks (`/admin/tracks`)
Create the topic tracks authors will choose from when submitting (name, a short code, optional description). Tracks are also used for two other things:
- **Reviewer expertise matching** — used by auto-assign to prefer reviewers whose expertise matches a submission's track.
- A track with submissions attached can't be deleted; remove or reassign those submissions first.

### Conference Settings (`/admin/settings`)
- Conference name, timezone
- Submission / review deadlines, notification date (shown on the homepage)
- **General Talk Duration** and **Invited Talk Duration** (minutes) — used to auto-calculate time slots when building the program (see §7)

### Users (`/admin/users`)
- **Invite User** — add someone by email and assign them the Reviewer and/or Chair role. They'll be able to sign in immediately with that email; no separate invitation email is sent, so let them know directly.
- Toggle the **Reviewer** / **Chair** role for any existing user (anyone who has ever signed in appears here, even authors).
- For reviewers, set **Expertise** — the track(s) they're knowledgeable in, used by auto-assign.
- You can't remove your own Chair role (to avoid accidentally locking yourself out).

## 4. Managing submissions (`/admin/submissions`)

The full list of submissions, filterable by status. Open any submission to see:

- Abstract PDF, keywords, authors
- All reviewers' scores, recommendations, and comments (including confidential comments only visible to you)
- The average score across submitted reviews
- **Program** — set the submission's **presentation category** (General or Invited). This determines its talk length once scheduled (§7); it doesn't affect anything else.
- **Decision** — click **Accept** or **Reject** to record a decision. This moves the submission to **Decided** status. It does not send anything to the author yet — do that from the Decisions page (§6).
- **Danger zone → Delete submission** — permanently deletes the submission and everything attached to it (abstract file, authors, review assignments, reviews). Use this to clean up test/duplicate submissions. This cannot be undone.

## 5. Assigning reviewers (`/admin/assignments`)

Shows every Submitted/Under Review submission with its current reviewers.

- **Assign manually** — pick a reviewer from the dropdown for a specific submission. Reviewers who are an author (or the submitter) on that submission are automatically excluded.
- **Auto Assign** — assigns reviewers to every submission that doesn't yet have enough (2 per submission by default), preferring reviewers whose expertise matches the track and balancing load across reviewers. Conflicts of interest are excluded automatically.
- **Remove** — unassigns a reviewer from a submission.
- **Send Reminders** — emails every reviewer who has a pending (not-yet-submitted) review, once per assignment.

### Pending Reviewer Notifications

Assigning a reviewer (manually or via Auto Assign) does **not** email them immediately. Instead, it shows up here, grouped per reviewer, so a reviewer given several submissions in one batch gets a single email listing everything, not one email each.

- Click **Send** next to a reviewer to notify just them.
- Click **Send All Pending (N)** to notify everyone with pending assignments at once.

If you unassign and later reassign the same reviewer to the same submission, it becomes pending again, regardless of any earlier notification — you'll need to send a new one.

## 6. Recording and sending decisions (`/admin/decisions`)

Lists every **Decided** submission (from §4).

- Each row shows whether the author has been notified yet, and how many reviewer comments (for the author) will be included in the email.
- **Send** — sends the accept/reject decision email to that submission's author.
- **Send All Pending (N)** — sends to every author not yet notified.

Notification emails include the decision and any reviewer comments marked "for author" — confidential comments to you are never included.

## 7. Building the program (`/admin/program`)

Only accepted (Accept-decided) submissions can be added to the program.

1. **New Session** — create a session with a title, type (Oral Session / Poster Session / Keynote / Break), room, optional track, and start/end time.
2. Under each session, use the search box to filter accepted, unassigned submissions by keyword or title, pick one, and click **Add**.
   - If an author on the submission is already scheduled in an overlapping session, you'll get a warning (but the assignment still goes through — it's your call).
3. For **Oral Session** sessions, each talk's start/end time is calculated automatically: sequentially from the session's start time, using each submission's presentation category (General or Invited) and the durations set on the Settings page (§3). If the talks run past the session's end time, a warning is shown so you can extend the session or move something out.
4. **Remove** takes a submission back out of a session.
5. **Export CSV** downloads the full program (including computed talk times) as a spreadsheet.
6. **View Public Page** opens `/program`, the read-only schedule page — visible only to you (Chair), since the program will ultimately be published on the official conference website rather than here.

## 8. Notification emails at a glance

| Trigger | Sent to | Sent automatically? |
|---|---|---|
| Author submits | Author | Yes, immediately |
| Reviewer assigned | Reviewer | No — you send it from Pending Reviewer Notifications (§5) |
| Review reminder | Reviewer with pending review | No — you trigger it with Send Reminders (§5) |
| Decision recorded | Author | No — you send it from the Decisions page (§6) |

## 9. Security notes

- Sign-in emails are rate-limited (1 per address per minute, 5 per source IP per 10 minutes) to prevent abuse of the sign-in form.
- Only accounts with the Chair role can access anything under `/admin`, delete submissions, or view the program.
