-- 20250823_public_raymond_lookup.sql

create table if not exists public.raymond_plate_locations (
  id bigserial primary key,
  truck_family text not null,     -- Reach, Orderpicker, Stand-up CB, Pallet Jack, etc.
  location_notes text not null,   -- Short sentence for UI
  source_url text,
  created_at timestamptz default now()
);

-- Post-1977 rule & any other parsing rules you add later
create table if not exists public.raymond_serial_rules (
  rule_name text primary key,
  applies_from_year int,
  model_digits int,               -- e.g., 3 (first 3 digits = model)
  year_digits_start int,          -- e.g., 4 (digits 4–5 are year)
  year_digits_len int,            -- e.g., 2
  notes text,
  source_url text,
  created_at timestamptz default now()
);

-- Legacy serial-range→year blocks (older series where public ranges exist)
create table if not exists public.raymond_serial_ranges (
  id bigserial primary key,
  series_or_model text not null,  -- e.g., "010 Walkies", "812 (020)"
  year int not null check (year between 1940 and 2100),
  serial_start text not null,
  serial_end text not null,
  source_url text,
  notes text,
  created_at timestamptz default now()
);

-- Optional: for nicer UX/autocomplete
create table if not exists public.raymond_model_families (
  code text primary key,          -- e.g., EASI, 7400-Series, 5200/5400/5600
  family text,
  example_models text,
  notes text,
  source_url text,
  created_at timestamptz default now()
);

-- RLS (public read)
alter table public.raymond_plate_locations enable row level security;
alter table public.raymond_serial_rules enable row level security;
alter table public.raymond_serial_ranges enable row level security;
alter table public.raymond_model_families enable row level security;

-- Drop policies if they exist, then create them (safer approach)
drop policy if exists "ro_raymond_plate_locations" on public.raymond_plate_locations;
drop policy if exists "ro_raymond_serial_rules" on public.raymond_serial_rules;
drop policy if exists "ro_raymond_serial_ranges" on public.raymond_serial_ranges;
drop policy if exists "ro_raymond_model_families" on public.raymond_model_families;

create policy "ro_raymond_plate_locations" 
  on public.raymond_plate_locations for select using (true);

create policy "ro_raymond_serial_rules"    
  on public.raymond_serial_rules    for select using (true);

create policy "ro_raymond_serial_ranges"   
  on public.raymond_serial_ranges   for select using (true);

create policy "ro_raymond_model_families"  
  on public.raymond_model_families  for select using (true);

create index if not exists idx_raymond_plate_family on public.raymond_plate_locations(truck_family);
create index if not exists idx_raymond_ranges_series on public.raymond_serial_ranges(series_or_model);

-- No destructive statements.
