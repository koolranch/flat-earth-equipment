-- 20250823_public_crown_lookup.sql
-- Crown Serial Number Lookup tables with RLS policies

create table if not exists public.crown_model_prefixes (
  prefix text primary key,         -- e.g., FC, SC, RC, RR, RD, RM, SP, ST, SX, WP, PE, PC, WT, TR, TC, TSP
  family text not null,            -- Counterbalance, Reach, Order Picker, Pallet, Stacker, Tugger, Turret, etc.
  notes text,
  example_models text,
  created_at timestamptz default now()
);

create table if not exists public.crown_plate_locations (
  id bigserial primary key,
  equipment_type text not null,    -- e.g., Counterbalance (C-5/FC), Stand-Up Counterbalance (RC), Reach (RR/RD/RM), etc.
  series text,                     -- optional series cue (e.g., 5200S, 3400, 3000, etc.)
  location_notes text not null,    -- short, UI-friendly guidance
  created_at timestamptz default now()
);

-- Unique index for idempotent seeding
create unique index if not exists crown_plate_unique
  on public.crown_plate_locations (equipment_type, coalesce(series,''), location_notes);

-- VIN 10th-character year map (for true 17-char VIN/PIN only)
create table if not exists public.crown_vin_year_map (
  code char(1) primary key,
  year int not null check (year between 1980 and 2030)
);

-- Enable RLS for read-only public access
alter table public.crown_model_prefixes enable row level security;
alter table public.crown_plate_locations enable row level security;
alter table public.crown_vin_year_map     enable row level security;

-- Drop policies if they exist, then create them (safer approach)
drop policy if exists "ro_crown_prefixes" on public.crown_model_prefixes;
drop policy if exists "ro_crown_plates" on public.crown_plate_locations;
drop policy if exists "ro_crown_vinmap" on public.crown_vin_year_map;

create policy "ro_crown_prefixes" on public.crown_model_prefixes for select using (true);
create policy "ro_crown_plates"   on public.crown_plate_locations for select using (true);
create policy "ro_crown_vinmap"   on public.crown_vin_year_map for select using (true);

-- Basic indexes for performance
create index if not exists idx_crown_prefixes_prefix on public.crown_model_prefixes(prefix);
create index if not exists idx_crown_plates_type on public.crown_plate_locations(equipment_type);

-- No destructive statements.
