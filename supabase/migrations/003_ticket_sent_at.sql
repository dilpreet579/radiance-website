-- Tracks whether the ticket email went out, so unsent ones can be retried (Admin → Registrations → Resend unsent tickets, and the daily cron).
-- Already included in schema.sql for fresh installs; run this once on an existing project.
alter table registrations add column if not exists ticket_sent_at timestamptz;

-- Existing rows: assume the oldest 90 were emailed before the Resend free quota (100/day) ran out; the rest count as unsent.
-- Check Resend → Logs if unsure; a wrongly "unsent" row only gets a second copy of the ticket.
update registrations set ticket_sent_at = created_at
 where ticket_sent_at is null
   and id in (select id from registrations order by created_at limit 90);
