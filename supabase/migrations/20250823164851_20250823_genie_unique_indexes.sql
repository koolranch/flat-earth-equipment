-- 20250823_genie_complete_lookup.sql
-- Complete Genie serial lookup tables + unique indexes for idempotent seeding

-- Table 1: Model prefixes (S, Z, GS, GTH, etc.)
create table if not exists public.genie_model_prefixes (
  prefix text primary key,        -- S, Z, GS, GTH, AWP, GR, IWP, DPL, TZ
  family text,                    -- Boom, Scissor, Telehandler, Vertical Lift
  notes text,
  example_models text,
  source_url text,
  created_at timestamptz default now()
);

-- Table 2: Plate location guidance by equipment type/series
create table if not exists public.genie_plate_locations (
  id bigserial primary key,
  equipment_type text not null,   -- Boom (S-Series), Scissor (GS), Telehandler (GTH), etc.
  series text,                    -- S40–S85, Slab Scissor (pre-2011), Modern, etc.
  location_notes text not null,   -- Short guidance text for UI
  source_url text,
  created_at timestamptz default now()
);

-- Table 3: Serial break notes for manual/schematic coverage ranges
create table if not exists public.genie_serial_breaks (
  id bigserial primary key,
  model text not null,            -- S-80 / S-85, GS-2046 / GS-2646 / GS-3246, etc.
  serial_note text not null,      -- "from serial number 101 to 785", "before serial number 17408"
  note text,                      -- Additional context: "Older units; separate manual coverage"
  source_url text,
  created_at timestamptz default now()
);

-- Enable RLS (read-only public access)
alter table public.genie_model_prefixes enable row level security;
alter table public.genie_plate_locations enable row level security;
alter table public.genie_serial_breaks enable row level security;

-- Drop policies if they exist, then create them (safer approach)
drop policy if exists "ro_genie_model_prefixes" on public.genie_model_prefixes;
drop policy if exists "ro_genie_plate_locations" on public.genie_plate_locations;
drop policy if exists "ro_genie_serial_breaks" on public.genie_serial_breaks;

create policy "ro_genie_model_prefixes" 
  on public.genie_model_prefixes for select using (true);

create policy "ro_genie_plate_locations" 
  on public.genie_plate_locations for select using (true);

create policy "ro_genie_serial_breaks" 
  on public.genie_serial_breaks for select using (true);

-- Basic indexes for performance
create index if not exists idx_genie_model_prefixes_prefix on public.genie_model_prefixes(prefix);
create index if not exists idx_genie_plate_locations_type on public.genie_plate_locations(equipment_type);
create index if not exists idx_genie_serial_breaks_model on public.genie_serial_breaks(model);

-- Unique indexes for idempotent seeding (ensures no duplicates on re-run)
create unique index if not exists genie_prefix_unique
  on public.genie_model_prefixes (prefix);

create unique index if not exists genie_plate_unique
  on public.genie_plate_locations (equipment_type, coalesce(series, ''), location_notes);

create unique index if not exists genie_breaks_model_serial_note_unique
  on public.genie_serial_breaks (model, serial_note);

-- No destructive statements.
