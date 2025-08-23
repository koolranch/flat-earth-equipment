-- 20250823_public_clark_lookup.sql
-- Clark Serial Number Lookup tables with RLS policies

-- Families / prefixes to infer truck type in UI
create table if not exists public.clark_model_prefixes (
  prefix text primary key,          -- e.g., TMX, ECX, GEX, GTX, EPX, S, GTS, C, SRX, OSX, OPX, WP, WT, PC, PE, ST, SX, WSX
  family text not null,             -- Electric Sit-Down, IC Counterbalance (Cushion/Pneumatic), Reach, Order Picker, Pallet, Stacker
  notes text,
  example_models text,
  created_at timestamptz default now()
);

-- Where to find the plate/stamp by family
create table if not exists public.clark_plate_locations (
  id bigserial primary key,
  equipment_type text not null,     -- e.g., Electric Sit-Down, IC Counterbalance, Reach (SRX), Order Picker (OSX/OPX), Pallet (WP/WT/PC/PE), Stacker (ST/SX/WSX)
  series text,                      -- optional (e.g., S-Series, GEN2, SRX14/16)
  location_notes text not null,     -- short guidance for UI
  created_at timestamptz default now()
);

-- Unique index for idempotent seeding
create unique index if not exists clark_plate_unique
  on public.clark_plate_locations (equipment_type, coalesce(series,''), location_notes);

-- VIN 10th char → year (only for true 17-char VIN/PIN)
create table if not exists public.clark_vin_year_map (
  code char(1) primary key,
  year int not null check (year between 1980 and 2030)
);

-- Legacy (pre-1958) year/month decoders for Carloader-era serials
create table if not exists public.clark_legacy_year_map (
  code char(1) primary key,         -- R,K,E,Q,U,I,P,M,T,C,L,A mapping to specific 1949–1957 years
  year int not null
);

create table if not exists public.clark_legacy_month_map (
  code char(1) primary key,         -- C,L,A,R,K,E,Q,U,I,P,M,T → Jan..Dec
  month int not null check (month between 1 and 12)
);

-- Enable RLS for read-only public access
alter table public.clark_model_prefixes enable row level security;
alter table public.clark_plate_locations enable row level security;
alter table public.clark_vin_year_map     enable row level security;
alter table public.clark_legacy_year_map  enable row level security;
alter table public.clark_legacy_month_map enable row level security;

-- Drop policies if they exist, then create them (safer approach)
drop policy if exists "ro_clark_prefixes" on public.clark_model_prefixes;
drop policy if exists "ro_clark_plates" on public.clark_plate_locations;
drop policy if exists "ro_clark_vinmap" on public.clark_vin_year_map;
drop policy if exists "ro_clark_legacy_y" on public.clark_legacy_year_map;
drop policy if exists "ro_clark_legacy_m" on public.clark_legacy_month_map;

create policy "ro_clark_prefixes" on public.clark_model_prefixes for select using (true);
create policy "ro_clark_plates"   on public.clark_plate_locations for select using (true);
create policy "ro_clark_vinmap"   on public.clark_vin_year_map    for select using (true);
create policy "ro_clark_legacy_y" on public.clark_legacy_year_map for select using (true);
create policy "ro_clark_legacy_m" on public.clark_legacy_month_map for select using (true);

-- Basic indexes for performance
create index if not exists idx_clark_prefixes_prefix on public.clark_model_prefixes(prefix);
create index if not exists idx_clark_plates_type on public.clark_plate_locations(equipment_type);

-- No destructive statements.
