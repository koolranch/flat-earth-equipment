-- 20250823_public_newholland_lookup.sql

create table if not exists public.nh_plate_locations (
  id bigserial primary key,
  equipment_type text not null,   -- Tractor, Skid Steer, Track Loader, Excavator, Combine, Forage Harvester, Backhoe, Telehandler
  series text,                    -- T8, PowerStar, L/LS, etc.
  location_notes text not null,
  source_url text,
  created_at timestamptz default now()
);

create table if not exists public.nh_serial_ranges (
  id bigserial primary key,
  model text not null,            -- 5030, 7740, L170, etc.
  serial_start text not null,
  serial_end text not null,
  year int not null check (year between 1960 and 2100),
  source_url text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.nh_prefix_patterns (
  id bigserial primary key,
  model text not null,            -- e.g., T8.350
  prefix text not null,           -- e.g., ZER (2015)
  year int not null check (year between 1960 and 2100),
  source_url text,
  notes text,
  created_at timestamptz default now()
);

alter table public.nh_plate_locations enable row level security;
alter table public.nh_serial_ranges enable row level security;
alter table public.nh_prefix_patterns enable row level security;

-- Drop policies if they exist, then create them (safer approach)
drop policy if exists "ro_nh_plate_locations" on public.nh_plate_locations;
drop policy if exists "ro_nh_serial_ranges" on public.nh_serial_ranges;
drop policy if exists "ro_nh_prefix_patterns" on public.nh_prefix_patterns;

create policy "ro_nh_plate_locations" 
  on public.nh_plate_locations for select using (true);

create policy "ro_nh_serial_ranges"  
  on public.nh_serial_ranges  for select using (true);

create policy "ro_nh_prefix_patterns" 
  on public.nh_prefix_patterns for select using (true);

create index if not exists idx_nh_plate_type   on public.nh_plate_locations(equipment_type);
create index if not exists idx_nh_ranges_model on public.nh_serial_ranges(model);
create index if not exists idx_nh_prefix_model on public.nh_prefix_patterns(model);
