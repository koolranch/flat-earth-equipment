-- 20250823_public_cat_lookup.sql
-- CAT Lift Trucks Serial Number Lookup tables with RLS policies

create table if not exists public.cat_model_prefixes (
  prefix text primary key,        -- GP, DP, EC, EP
  family text not null,           -- LP Gas Pneumatic, Diesel Pneumatic, Electric Cushion, Electric Pneumatic
  notes text,
  example_models text,
  created_at timestamptz default now()
);

create table if not exists public.cat_plate_locations (
  id bigserial primary key,
  equipment_type text not null,   -- IC Pneumatic, Electric Cushion, Electric Pneumatic
  series text,                    -- optional (e.g., N/N2/N3)
  location_notes text not null,   -- UI-friendly guidance
  created_at timestamptz default now()
);

-- Unique index for idempotent seeding
create unique index if not exists cat_plate_unique
  on public.cat_plate_locations (equipment_type, coalesce(series,''), location_notes);

-- VIN 10th-char → year (17-char VIN/PIN only)
create table if not exists public.cat_vin_year_map (
  code char(1) primary key,
  year int not null check (year between 1980 and 2030)
);

-- Enable RLS for read-only public access
alter table public.cat_model_prefixes enable row level security;
alter table public.cat_plate_locations enable row level security;
alter table public.cat_vin_year_map enable row level security;

-- Drop policies if they exist, then create them (safer approach)
drop policy if exists "ro_cat_prefixes" on public.cat_model_prefixes;
drop policy if exists "ro_cat_plates" on public.cat_plate_locations;
drop policy if exists "ro_cat_vinmap" on public.cat_vin_year_map;

create policy "ro_cat_prefixes" on public.cat_model_prefixes for select using (true);
create policy "ro_cat_plates"   on public.cat_plate_locations for select using (true);
create policy "ro_cat_vinmap"   on public.cat_vin_year_map for select using (true);

-- Basic indexes for performance
create index if not exists idx_cat_prefixes_prefix on public.cat_model_prefixes(prefix);
create index if not exists idx_cat_plates_type on public.cat_plate_locations(equipment_type);

-- No destructive statements.
