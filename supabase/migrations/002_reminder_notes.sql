-- Adds the "Extra notes" field (refreshments, SRHC bus info) to reminder emails.
-- Already included in schema.sql for fresh installs; run this once on an existing project.
alter table reminder_templates add column if not exists notes text not null default '';

update reminder_templates set notes = 'Refreshments will be provided. NIT Delhi students at the SRHC campus: a separate bus leaves at 7:45 PM.'
 where notes = '' and day between '2026-10-26' and '2026-10-30';
