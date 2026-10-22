-- Radiance 2026 schema. Run once in the Supabase SQL editor.
-- All access goes through the server with the service-role key; RLS is on with no policies,
-- so the anon key can read/write nothing.

create extension if not exists pgcrypto;

-- ---------- registrations ----------
create sequence if not exists token_seq start 1;

create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  name text not null,
  gender text not null,
  is_nit boolean not null,
  institute text not null,
  roll text not null,
  roll_key text not null,        -- lower(trim(roll))
  year text not null,
  branch text not null,
  phone text not null,           -- last 10 digits
  email text not null,           -- lower(trim(email))
  workshops text[] not null default '{}',   -- outside students only: photo|film|motion|graphic
  consents jsonb not null default '{}',
  created_at timestamptz not null default now(),   -- doubles as the consent timestamp
  -- photo walk selection (admin-managed)
  engagement numeric,
  remarks text,
  walk_selected boolean not null default false
);
create unique index if not exists registrations_email_key on registrations (email);
create unique index if not exists registrations_phone_key on registrations (phone);
create unique index if not exists registrations_roll_key on registrations (roll_key);

-- ---------- sessions & checkpoints & scans ----------
create table if not exists sessions (
  key text primary key,
  label text not null,
  position int not null,
  nit_only boolean not null default false
);
insert into sessions (key, label, position, nit_only) values
  ('inaugural', 'Inaugural + Comedy', 1, true),
  ('photo',     'Photography Workshop', 2, false),
  ('film',      'Filmmaking Workshop', 3, false),
  ('motion',    'Motion Design Workshop', 4, false),
  ('graphic',   'Graphic Design Workshop', 5, false),
  ('walk',      'Photo Walk', 6, true),
  ('exhibition','Exhibition', 7, false)
on conflict (key) do nothing;

create table if not exists checkpoints (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position int not null default 0
);

create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references registrations(id) on delete cascade,
  session_key text not null references sessions(key),
  checkpoint_id uuid references checkpoints(id) on delete cascade,
  admin_email text,
  scanned_at timestamptz not null default now()
);
-- one scan per (student, session, checkpoint); null checkpoint treated as a single value
create unique index if not exists scans_unique on scans
  (registration_id, session_key, coalesce(checkpoint_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- ---------- admin-managed content ----------
create table if not exists competitions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('online', 'campus')),
  genre text not null,
  title text not null,
  description text not null default '',
  prize text not null default '',
  theme text not null default '',
  deadline text not null default '',
  url text not null default '',
  live boolean not null default false,
  position int not null default 0
);

create table if not exists sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text not null default '',
  logo_url text not null default '',
  link text not null default '',
  tier text not null default 'associate' check (tier in ('title', 'associate')),
  position int not null default 0
);
insert into sponsors (name, tagline, link, tier)
select 'Bharat Petroleum', 'Radiance 2026 is proudly presented by Bharat Petroleum', 'https://www.bharatpetroleum.in', 'title'
where not exists (select 1 from sponsors where tier = 'title');

create table if not exists settings (
  key text primary key,
  value jsonb not null
);

-- ---------- reminder emails ----------
create table if not exists reminder_templates (
  day date primary key,
  audience text not null check (audience in ('nit', 'nit_and_workshop', 'walk_selected')),
  workshop_key text,              -- for workshop days, outside students with this workshop also get it
  subject text not null,
  body text not null,             -- placeholders: {name} {token} {venue} {event}
  notes text not null default '', -- extra notes appended to the body (refreshments, SRHC bus)
  event text not null,
  venue text not null default 'Venue to be announced'
);
insert into reminder_templates (day, audience, workshop_key, subject, body, event) values
  ('2026-10-26', 'nit', null, 'Today: {event} at NIT Delhi', E'Hi {name},\n\n{event} is today at {venue}. Bring your ticket (token {token}) and show the QR at the entrance.', 'Inaugural Ceremony, 5:30–7:30 PM'),
  ('2026-10-27', 'nit_and_workshop', 'photo', 'Today: {event} at NIT Delhi', E'Hi {name},\n\n{event} is today at {venue}. Bring your ticket (token {token}).', 'Photography Workshop, 5:30–7:30 PM'),
  ('2026-10-28', 'nit_and_workshop', 'film', 'Today: {event} at NIT Delhi', E'Hi {name},\n\n{event} is today at {venue}. Bring your ticket (token {token}).', 'Cinematic Filmmaking Workshop, 3:30–6:30 PM'),
  ('2026-10-29', 'nit_and_workshop', 'motion', 'Today: {event} at NIT Delhi', E'Hi {name},\n\n{event} is today at {venue}. Bring your ticket (token {token}).', 'Motion Design Workshop, 5:30–7:30 PM'),
  ('2026-10-30', 'nit_and_workshop', 'graphic', 'Today: {event} at NIT Delhi', E'Hi {name},\n\n{event} is today at {venue}. Bring your ticket (token {token}).', 'Graphic Design Workshop, 5:30–7:30 PM'),
  ('2026-10-31', 'walk_selected', null, 'Today: Delhi Photo Walk', E'Hi {name},\n\nYou are selected for the Delhi Photo Walk today. Venue / bus pickup: {venue}. Carry your ticket (token {token}).', 'Delhi Photo Walk')
on conflict (day) do nothing;

create table if not exists reminder_log (
  id uuid primary key default gen_random_uuid(),
  day date not null,
  email text not null,
  ok boolean not null,
  error text,
  test boolean not null default false,
  sent_at timestamptz not null default now()
);

-- ---------- admins ----------
-- Create users in Supabase Auth, then insert their auth.users id here.
create table if not exists admins (
  user_id uuid primary key,
  email text not null,
  role text not null check (role in ('scanner', 'super'))
);

-- ---------- atomic registration ----------
-- Idempotent: a repeat email/phone/roll returns the existing row with dup = true.
-- Seat caps for outside students are enforced under an advisory lock.
create or replace function register_student(
  p_name text, p_gender text, p_is_nit boolean, p_institute text, p_roll text,
  p_year text, p_branch text, p_phone text, p_email text,
  p_workshops text[], p_consents jsonb, p_seat_cap int
) returns jsonb
language plpgsql
as $$
declare
  v_email text := lower(trim(p_email));
  v_phone text := right(regexp_replace(p_phone, '\D', '', 'g'), 10);
  v_roll text := lower(trim(p_roll));
  v_existing registrations;
  v_ws text;
  v_taken int;
  v_row registrations;
begin
  perform pg_advisory_xact_lock(26102026);

  select * into v_existing from registrations
   where email = v_email or phone = v_phone or roll_key = v_roll limit 1;
  if found then
    return jsonb_build_object('dup', true, 'reg', to_jsonb(v_existing));
  end if;

  if not p_is_nit then
    foreach v_ws in array p_workshops loop
      select count(*) into v_taken from registrations
       where not is_nit and v_ws = any(workshops);
      if v_taken >= p_seat_cap then
        return jsonb_build_object('error', 'full', 'workshop', v_ws);
      end if;
    end loop;
  end if;

  insert into registrations (token, name, gender, is_nit, institute, roll, roll_key, year, branch, phone, email, workshops, consents)
  values ('RAD26-' || lpad(nextval('token_seq')::text, 4, '0'), trim(p_name), p_gender, p_is_nit,
          case when p_is_nit then 'NIT Delhi' else trim(p_institute) end,
          trim(p_roll), v_roll, p_year, trim(p_branch), v_phone, v_email,
          case when p_is_nit then '{}' else p_workshops end, p_consents)
  returning * into v_row;

  return jsonb_build_object('dup', false, 'reg', to_jsonb(v_row));
end;
$$;

-- ---------- RLS: deny everything to anon/authenticated; service role bypasses ----------
alter table registrations enable row level security;
alter table sessions enable row level security;
alter table checkpoints enable row level security;
alter table scans enable row level security;
alter table competitions enable row level security;
alter table sponsors enable row level security;
alter table settings enable row level security;
alter table reminder_templates enable row level security;
alter table reminder_log enable row level security;
alter table admins enable row level security;
revoke execute on function register_student from public, anon, authenticated;
