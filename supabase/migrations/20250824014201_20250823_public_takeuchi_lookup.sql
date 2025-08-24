-- Map cues → families for inference
create table if not exists public.takeuchi_model_cues (
  cue text primary key,              -- e.g., TL12V2, TL8R2, TB260, TB290, TW80, TCR50-2
  family text not null,              -- Compact Track Loader, Compact Excavator, Wheel Loader, Skid Steer Loader, Crawler Dumper
  notes text,
  example_models text,
  created_at timestamptz default now()
);

-- Plate/label guidance by family/series
create table if not exists public.takeuchi_plate_locations (
  id bigserial primary key,
  equipment_type text not null,      -- family values
  series text,                       -- TB-series, TL-series, TW-series, TCR-series, TS-series
  location_notes text not null,      -- concise "where to look" + what to record
  created_at timestamptz default now()
);
create unique index if not exists takeuchi_plate_unique
  on public.takeuchi_plate_locations (equipment_type, coalesce(series,''), location_notes);

-- Known model serial-range blocks from parts/OM docs (textual, non-authoritative)
create table if not exists public.takeuchi_model_serial_ranges (
  id bigserial primary key,
  model_code text not null,          -- e.g., TL12V2, TL230 Series 2, TB290, TL8, TB216
  serial_range text not null,        -- e.g., "S/N 412000006–"
  notes text,
  created_at timestamptz default now()
);
create index if not exists takeuchi_model_serial_ranges_model_idx on public.takeuchi_model_serial_ranges (model_code);

-- RLS read-only
alter table public.takeuchi_model_cues enable row level security;
alter table public.takeuchi_plate_locations enable row level security;
alter table public.takeuchi_model_serial_ranges enable row level security;

-- Drop policies if they exist, then create them
drop policy if exists "ro_takeuchi_cues" on public.takeuchi_model_cues;
drop policy if exists "ro_takeuchi_plates" on public.takeuchi_plate_locations;
drop policy if exists "ro_takeuchi_ranges" on public.takeuchi_model_serial_ranges;

create policy "ro_takeuchi_cues" on public.takeuchi_model_cues for select using (true);
create policy "ro_takeuchi_plates" on public.takeuchi_plate_locations for select using (true);
create policy "ro_takeuchi_ranges" on public.takeuchi_model_serial_ranges for select using (true);
