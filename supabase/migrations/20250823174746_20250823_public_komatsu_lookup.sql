-- 20250823_public_komatsu_lookup.sql
-- Komatsu Serial Number Lookup tables with RLS policies

-- Families/prefixes to infer truck type in UI
create table if not exists public.komatsu_model_prefixes (
  prefix text primary key,        -- FG, FD, FB
  family text not null,           -- IC Gas/LP, IC Diesel, Electric Counterbalance
  notes text,
  example_models text,
  created_at timestamptz default now()
);

-- Where to find the plate/stamp by family
create table if not exists public.komatsu_plate_locations (
  id bigserial primary key,
  equipment_type text not null,   -- IC Counterbalance (AX/BX), Electric Counterbalance (FB)
  series text,                    -- optional (AX/BX, FB RL/RW/..)
  location_notes text not null,   -- short, UI-friendly guidance
  created_at timestamptz default now()
);

-- Unique index for idempotent seeding
create unique index if not exists komatsu_plate_unique
  on public.komatsu_plate_locations (equipment_type, coalesce(series,''), location_notes);

-- IC model code key (decoded meanings from the manual's table)
create table if not exists public.komatsu_ic_model_code_key (
  position int not null,          -- 1..4
  code text not null,             -- e.g., FG, FD, 15/18/.., S/H/C/T, US/LS
  meaning text not null,
  primary key (position, code)
);

-- VIN 10th-character year map (ONLY if serial is a true 17-char VIN/PIN)
create table if not exists public.komatsu_vin_year_map (
  code char(1) primary key,
  year int not null check (year between 1980 and 2030)
);

-- Enable RLS for read-only public access
alter table public.komatsu_model_prefixes enable row level security;
alter table public.komatsu_plate_locations enable row level security;
alter table public.komatsu_ic_model_code_key enable row level security;
alter table public.komatsu_vin_year_map enable row level security;

-- Drop policies if they exist, then create them (safer approach)
drop policy if exists "ro_komatsu_prefixes" on public.komatsu_model_prefixes;
drop policy if exists "ro_komatsu_plates" on public.komatsu_plate_locations;
drop policy if exists "ro_komatsu_ic_key" on public.komatsu_ic_model_code_key;
drop policy if exists "ro_komatsu_vinmap" on public.komatsu_vin_year_map;

create policy "ro_komatsu_prefixes" on public.komatsu_model_prefixes for select using (true);
create policy "ro_komatsu_plates"   on public.komatsu_plate_locations for select using (true);
create policy "ro_komatsu_ic_key"   on public.komatsu_ic_model_code_key for select using (true);
create policy "ro_komatsu_vinmap"   on public.komatsu_vin_year_map for select using (true);

-- Basic indexes for performance
create index if not exists idx_komatsu_prefixes_prefix on public.komatsu_model_prefixes(prefix);
create index if not exists idx_komatsu_plates_type on public.komatsu_plate_locations(equipment_type);
create index if not exists idx_komatsu_ic_key_position on public.komatsu_ic_model_code_key(position);

-- No destructive statements.
