-- 20250823_lookup_toyota_serial.sql
-- Isolated schema to avoid any collision with existing app tables
create schema if not exists lookup;

create table if not exists lookup.toyota_serial_lookup (
  id                bigserial primary key,
  model_code        text not null,         -- e.g., 7FGCU25, 8FGCU25
  year              int  not null check (year between 1970 and 2100),
  beginning_serial  text not null,         -- keep as text to preserve leading zeros
  source            text,
  source_page       text,
  notes             text,
  created_at        timestamptz default now()
);

-- Prevent duplicates when seeding repeatedly
create unique index if not exists ux_toyota_model_year
  on lookup.toyota_serial_lookup(model_code, year);

alter table lookup.toyota_serial_lookup enable row level security;

-- Read-only public policy (so anon can SELECT)
-- If you prefer server-only access, comment this policy out and rely on the API route w/ service key.
create policy "Public read"
  on lookup.toyota_serial_lookup
  for select
  using (true);

-- No insert/update/delete policies (service role bypasses RLS automatically).
