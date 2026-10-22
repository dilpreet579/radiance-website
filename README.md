# Radiance 2026 website

NIT Delhi's Annual Creative Fest (3rd edition, 26 Oct – 5 Nov 2026). Next.js (App Router) + Supabase + Resend.
Spec: `docs/PLAN.md`. Design source: `docs/design-handoff/`.

## Setup

1. **Supabase**: create a project, run `supabase/schema.sql` in the SQL editor.
2. **Admins**: in Supabase Auth, create 1 super admin + 5 scanner users (email/password). Then in the SQL editor:
   ```sql
   insert into admins (user_id, email, role)
   select id, email, 'super' from auth.users where email = 'you@example.com';
   -- scanners: role 'scanner'
   ```
3. **Resend**: create an API key; verify the sending domain so mail reaches any address.
4. `cp .env.example .env.local` and fill it in.
5. `npm install && npm run dev`.

## Deploy (Vercel)

Set the same env vars (plus `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`). `vercel.json` schedules `/api/cron/reminders`
daily at 04:00 UTC = 09:30 IST; it only sends on days that have a reminder template.

## Where things live

| Area | Path |
|---|---|
| Public pages + copy | `app/*`, `lib/content.ts` |
| Registration + ticket | `app/register`, `register_student()` in `supabase/schema.sql` |
| Admin (login, scan, leaderboard, managers) | `app/admin` |
| CSV export | `app/admin/export` |
| Reminder emails + cron | `lib/reminders.ts`, `app/api/cron/reminders` |

Admin-editable (no code change): competitions, sponsors, checkpoints, seat cap, notes, consent text, reminder templates.
Competitions/sponsors fall back to the static placeholders in `lib/content.ts` / `lib/sponsors.ts` while their tables are empty.
