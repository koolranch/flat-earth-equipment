-- Families / prefixes to infer truck type in UI
create table if not exists public.mitsu_model_prefixes (
  prefix text primary key,         -- FG, FD, FGC, FB
  family text not null,            -- IC Gas/LP (Pneumatic), IC Diesel (Pneumatic), IC Gas/LP (Cushion), Electric Counterbalance
  notes text,
  example_models text,
  created_at timestamptz default now()
);

-- Where to find serial/plate by family
create table if not exists public.mitsu_plate_locations (
  id bigserial primary key,
  equipment_type text not null,    -- IC Pneumatic, IC Cushion, Electric Counterbalance
  series text,                     -- optional (e.g., N/N3, EDiA EX)
  location_notes text not null,    -- short UI guidance (name plate + stamped areas)
  created_at timestamptz default now()
);
create unique index if not exists mitsu_plate_unique
  on public.mitsu_plate_locations (equipment_type, coalesce(series,''), location_notes);

-- (Optional) model code helper: common capacity codes in "N" families
create table if not exists public.mitsu_capacity_map (
  code text primary key,           -- 15, 18, 20, 25, 30, 33, 35
  approx_capacity text not null    -- "≈3,000 lb", etc.
);

-- VIN 10th-character → year (apply ONLY to true 17-char VIN/PIN)
create table if not exists public.mitsu_vin_year_map (
  code char(1) primary key,
  year int not null check (year between 1980 and 2030)
);

-- RLS read-only
alter table public.mitsu_model_prefixes enable row level security;
alter table public.mitsu_plate_locations enable row level security;
alter table public.mitsu_capacity_map enable row level security;
alter table public.mitsu_vin_year_map enable row level security;

create policy if not exists "ro_mitsu_prefixes" on public.mitsu_model_prefixes for select using (true);
create policy if not exists "ro_mitsu_plates"   on public.mitsu_plate_locations for select using (true);
create policy if not exists "ro_mitsu_caps"     on public.mitsu_capacity_map for select using (true);
create policy if not exists "ro_mitsu_vinmap"   on public.mitsu_vin_year_map for select using (true);
