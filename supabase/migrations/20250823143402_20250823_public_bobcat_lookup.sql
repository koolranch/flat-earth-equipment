-- 20250823_public_bobcat_lookup.sql
-- Tables support the hub UX: plate locations by equipment type/series,
-- optional legacy serial->year ranges for specific models (e.g. 843),
-- and an optional module dictionary (first 4 digits -> likely model/engine).

create table if not exists public.bobcat_plate_locations (
  id bigserial primary key,
  equipment_type text not null,   -- Loader, Track Loader, Excavator, Mini Track Loader, etc.
  series text,                    -- R-Series, M-Series, Older/Classic, etc.
  location_notes text not null,   -- Short sentence for UI
  source_url text,
  created_at timestamptz default now()
);

create table if not exists public.bobcat_serial_ranges (
  id bigserial primary key,
  model text not null,            -- e.g., 843
  serial_start text not null,     -- keep text to preserve formatting
  serial_end text not null,
  year int not null check (year between 1960 and 2100),
  source_url text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.bobcat_module_dictionary (
  module_code text primary key,   -- first 4 digits
  likely_model text,
  engine text,
  notes text,
  source_url text,
  created_at timestamptz default now()
);

-- RLS (read-only public)
alter table public.bobcat_plate_locations enable row level security;
alter table public.bobcat_serial_ranges enable row level security;
alter table public.bobcat_module_dictionary enable row level security;

-- Drop policies if they exist, then create them (safer approach)
drop policy if exists "ro_bobcat_plate_locations" on public.bobcat_plate_locations;
drop policy if exists "ro_bobcat_serial_ranges" on public.bobcat_serial_ranges;
drop policy if exists "ro_bobcat_module_dictionary" on public.bobcat_module_dictionary;

create policy "ro_bobcat_plate_locations"
  on public.bobcat_plate_locations for select using (true);

create policy "ro_bobcat_serial_ranges"
  on public.bobcat_serial_ranges for select using (true);

create policy "ro_bobcat_module_dictionary"
  on public.bobcat_module_dictionary for select using (true);

-- Helpful indexes
create index if not exists idx_bobcat_plate_locations_type on public.bobcat_plate_locations(equipment_type);
create index if not exists idx_bobcat_serial_ranges_model on public.bobcat_serial_ranges(model);

-- No destructive statements.
