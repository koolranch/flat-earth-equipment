-- 20250823_public_hyster_lookup.sql
-- Use public schema to align with existing Toyota implementation.
create table if not exists public.hyster_plants (
  code text primary key,
  name text,
  city text,
  state_province text,
  country text,
  notes text
);

create table if not exists public.hyster_model_prefixes (
  prefix text primary key,
  series text,
  marketed_model text,
  notes text
);

alter table public.hyster_plants enable row level security;
alter table public.hyster_model_prefixes enable row level security;

-- Drop policies if they exist, then create them (safer approach)
drop policy if exists "ro_hyster_plants" on public.hyster_plants;
drop policy if exists "ro_hyster_model_prefixes" on public.hyster_model_prefixes;

create policy "ro_hyster_plants"
  on public.hyster_plants for select using (true);

create policy "ro_hyster_model_prefixes"
  on public.hyster_model_prefixes for select using (true);

create index if not exists idx_hyster_plants_code on public.hyster_plants(code);
create index if not exists idx_hyster_model_prefixes_prefix on public.hyster_model_prefixes(prefix);

-- NOTE: Year-code mapping is handled in API logic (constant map), not a table.
