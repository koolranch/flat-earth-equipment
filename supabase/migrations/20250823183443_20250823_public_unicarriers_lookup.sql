-- Model prefix → family map (to infer UI guidance)
create table if not exists public.uc_model_prefixes (
  prefix text primary key,     -- AF, PF, CF, BX, BXC, TX, SCX, SRX
  family text not null,        -- IC Pneumatic, IC Cushion, Electric Sit-Down, Stand-up CB, Reach Truck
  notes text,
  example_models text,
  created_at timestamptz default now()
);

-- Plate / stamped-serial locations by family + series
create table if not exists public.uc_plate_locations (
  id bigserial primary key,
  equipment_type text not null,    -- IC Pneumatic, IC Cushion, Electric Sit-Down, Stand-up CB, Reach Truck
  series text,                     -- e.g., Platinum II, BX(BXC), TX, SCX, SRX
  location_notes text not null,    -- concise UI guidance
  created_at timestamptz default now()
);
create unique index if not exists uc_plate_unique
  on public.uc_plate_locations (equipment_type, coalesce(series,''), location_notes);

-- Capacity code helper (advisory: common two-digit codes)
create table if not exists public.uc_capacity_map (
  code text primary key,           -- 15,18,20,25,30,33,35,40,45,50,55
  approx_capacity text not null    -- "≈5,000 lb", etc.
);

-- VIN 10th-char → year (apply ONLY to true 17-char VIN/PIN)
create table if not exists public.uc_vin_year_map (
  code char(1) primary key,
  year int not null check (year between 1980 and 2030)
);

-- Optional: series examples (from O&M patterns; string advisory only)
create table if not exists public.uc_series_examples (
  series_code text primary key,    -- e.g., 1F1 / 1F2
  example_note text not null       -- "Chassis serial stamped on front panel (1F1/1F2)"
);

-- RLS read-only
alter table public.uc_model_prefixes enable row level security;
alter table public.uc_plate_locations enable row level security;
alter table public.uc_capacity_map   enable row level security;
alter table public.uc_vin_year_map   enable row level security;
alter table public.uc_series_examples enable row level security;

drop policy if exists "ro_uc_prefixes" on public.uc_model_prefixes;
drop policy if exists "ro_uc_plates" on public.uc_plate_locations;
drop policy if exists "ro_uc_caps" on public.uc_capacity_map;
drop policy if exists "ro_uc_vinmap" on public.uc_vin_year_map;
drop policy if exists "ro_uc_series" on public.uc_series_examples;

create policy "ro_uc_prefixes" on public.uc_model_prefixes for select using (true);
create policy "ro_uc_plates" on public.uc_plate_locations for select using (true);
create policy "ro_uc_caps" on public.uc_capacity_map for select using (true);
create policy "ro_uc_vinmap" on public.uc_vin_year_map for select using (true);
create policy "ro_uc_series" on public.uc_series_examples for select using (true);
