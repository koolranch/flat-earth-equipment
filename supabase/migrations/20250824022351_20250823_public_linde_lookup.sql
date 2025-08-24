-- Model cues → families
create table if not exists public.linde_model_cues (
  cue text primary key,           -- e.g., E16, E20, E25, E35, X20, H35, R16, L14, V10
  family text not null,           -- Electric Counterbalance, IC Counterbalance, Reach Truck, Pallet Stacker, Order Picker
  notes text,
  example_models text,
  created_at timestamptz default now()
);

-- Plate/nameplate guidance by family/series
create table if not exists public.linde_plate_locations (
  id bigserial primary key,
  equipment_type text not null,   -- family
  series text,                    -- E-series, H-series, X-series, R-series, L-series, V-series
  location_notes text not null,   -- concise "where to look" + what to record
  created_at timestamptz default now()
);
create unique index if not exists linde_plate_unique
  on public.linde_plate_locations (equipment_type, coalesce(series,''), location_notes);

-- Optional: model-level serial notes (textual; Linde rarely publishes numeric ranges)
create table if not exists public.linde_model_serial_notes (
  id bigserial primary key,
  model_code text not null,       -- e.g., R14-R20, V10, E20-35, H20-35
  note text not null,
  created_at timestamptz default now()
);
create index if not exists linde_model_serial_notes_model_idx on public.linde_model_serial_notes (model_code);

-- RLS read-only
alter table public.linde_model_cues enable row level security;
alter table public.linde_plate_locations enable row level security;
alter table public.linde_model_serial_notes enable row level security;

-- Drop policies if they exist, then create them
drop policy if exists "ro_linde_cues" on public.linde_model_cues;
drop policy if exists "ro_linde_plates" on public.linde_plate_locations;
drop policy if exists "ro_linde_notes" on public.linde_model_serial_notes;

create policy "ro_linde_cues" on public.linde_model_cues for select using (true);
create policy "ro_linde_plates" on public.linde_plate_locations for select using (true);
create policy "ro_linde_notes" on public.linde_model_serial_notes for select using (true);
