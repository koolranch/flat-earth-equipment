-- 20250823_public_yale_lookup.sql

create table if not exists public.yale_plants (
  code text primary key,   -- single-letter plant code (A,B,D,...)
  name text,
  city text,
  state_province text,
  country text,
  notes text
);

create table if not exists public.yale_model_prefixes (
  prefix text primary key, -- design/series (alphanumeric)
  family text,             -- e.g., Veracitor VX, ERP, etc.
  marketed_model text,
  notes text
);

alter table public.yale_plants enable row level security;
alter table public.yale_model_prefixes enable row level security;

-- Drop policies if they exist, then create them (safer approach)
drop policy if exists "ro_yale_plants" on public.yale_plants;
drop policy if exists "ro_yale_model_prefixes" on public.yale_model_prefixes;

create policy "ro_yale_plants" 
  on public.yale_plants for select using (true);

create policy "ro_yale_model_prefixes" 
  on public.yale_model_prefixes for select using (true);

create index if not exists idx_yale_plants_code on public.yale_plants(code);
create index if not exists idx_yale_model_prefixes_prefix on public.yale_model_prefixes(prefix);

-- No destructive statements.
