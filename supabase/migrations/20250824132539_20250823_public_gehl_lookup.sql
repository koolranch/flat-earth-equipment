-- Model cues → families
create table if not exists public.gehl_model_cues (
  cue text primary key,                  -- e.g., R135, R190, R220, V270, RT175, RT210, RS6-42, AL650
  family text not null,                  -- Skid Steer, Track Loader, Telehandler, Articulated Loader
  notes text,
  example_models text,
  created_at timestamptz default now()
);

-- Plate/nameplate guidance by family/series
create table if not exists public.gehl_plate_locations (
  id bigserial primary key,
  equipment_type text not null,          -- family
  series text,                           -- R-series, V-series, RT-series, RS-series, AL-series
  location_notes text not null,          -- concise "where to look" + what to record
  created_at timestamptz default now()
);
create unique index if not exists gehl_plate_unique
  on public.gehl_plate_locations (equipment_type, coalesce(series,''), location_notes);

-- Published serial ranges (textual; no decoding)
create table if not exists public.gehl_model_serial_ranges (
  id bigserial primary key,
  model_code text not null,              -- e.g., RT175; RT210; RS6-42; AL650
  serial_range text not null,            -- e.g., "275000 & above", "GHL320001 & above"
  notes text,
  created_at timestamptz default now()
);
create index if not exists gehl_model_serial_ranges_model_idx on public.gehl_model_serial_ranges (model_code);

-- Model-level serial notes (textual; specific model guidance)
create table if not exists public.gehl_model_serial_notes (
  id bigserial primary key,
  model_code text not null,              -- e.g., R135–R260, V270/V330, RT175–RT215
  note text not null,
  created_at timestamptz default now()
);
create index if not exists gehl_model_serial_notes_model_idx on public.gehl_model_serial_notes (model_code);

-- RLS read-only
alter table public.gehl_model_cues enable row level security;
alter table public.gehl_plate_locations enable row level security;
alter table public.gehl_model_serial_ranges enable row level security;
alter table public.gehl_model_serial_notes enable row level security;

-- Drop policies if they exist, then create them
drop policy if exists "ro_gehl_cues" on public.gehl_model_cues;
drop policy if exists "ro_gehl_plates" on public.gehl_plate_locations;
drop policy if exists "ro_gehl_ranges" on public.gehl_model_serial_ranges;
drop policy if exists "ro_gehl_notes" on public.gehl_model_serial_notes;

create policy "ro_gehl_cues" on public.gehl_model_cues for select using (true);
create policy "ro_gehl_plates" on public.gehl_plate_locations for select using (true);
create policy "ro_gehl_ranges" on public.gehl_model_serial_ranges for select using (true);
create policy "ro_gehl_notes" on public.gehl_model_serial_notes for select using (true);
