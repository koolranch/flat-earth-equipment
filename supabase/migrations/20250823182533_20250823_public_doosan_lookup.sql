-- Model prefixes → families (to infer UI guidance)
create table if not exists public.doosan_model_prefixes (
  prefix text primary key,        -- G, D, GC, B, BR
  family text not null,           -- IC Gas Pneumatic, IC Diesel Pneumatic, IC Gas Cushion, Electric Counterbalance, Reach Truck
  notes text,
  example_models text,
  created_at timestamptz default now()
);

-- Where to find plates/stamps by family
create table if not exists public.doosan_plate_locations (
  id bigserial primary key,
  equipment_type text not null,   -- IC Pneumatic, IC Cushion, Electric Counterbalance, Reach Truck
  series text,                    -- optional (e.g., 5/7 series)
  location_notes text not null,   -- UI-friendly guidance
  created_at timestamptz default now()
);
create unique index if not exists doosan_plate_unique
  on public.doosan_plate_locations (equipment_type, coalesce(series,''), location_notes);

-- Capacity code helper (advisory; common 2-digit codes in model names like G25, B30)
create table if not exists public.doosan_capacity_map (
  code text primary key,          -- 15,18,20,25,30,33,35,40,45,50,55
  approx_capacity text not null   -- "≈5,000 lb", etc.
);

-- VIN 10th-character → year (apply ONLY to true 17-char VIN/PIN)
create table if not exists public.doosan_vin_year_map (
  code char(1) primary key,
  year int not null check (year between 1980 and 2030)
);

-- RLS read-only
alter table public.doosan_model_prefixes enable row level security;
alter table public.doosan_plate_locations enable row level security;
alter table public.doosan_capacity_map enable row level security;
alter table public.doosan_vin_year_map enable row level security;

drop policy if exists "ro_doosan_prefixes" on public.doosan_model_prefixes;
drop policy if exists "ro_doosan_plates" on public.doosan_plate_locations;
drop policy if exists "ro_doosan_caps" on public.doosan_capacity_map;
drop policy if exists "ro_doosan_vinmap" on public.doosan_vin_year_map;

create policy "ro_doosan_prefixes" on public.doosan_model_prefixes for select using (true);
create policy "ro_doosan_plates" on public.doosan_plate_locations for select using (true);
create policy "ro_doosan_caps" on public.doosan_capacity_map for select using (true);
create policy "ro_doosan_vinmap" on public.doosan_vin_year_map for select using (true);
