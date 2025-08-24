-- Model cues -> families to help inference and UI copy
create table if not exists public.ep_model_cues (
  cue text primary key,                 -- e.g., EFL252, EFL181, CPD25L1, CPD50L1, CQD16, JX1, EPT12-EZ
  family text not null,                 -- Counterbalance Forklift, Reach Truck, Pallet Truck, Stacker, Order Picker, Tow Tractor
  notes text,
  example_models text,
  created_at timestamptz default now()
);

-- Plate/nameplate guidance by family/series
create table if not exists public.ep_plate_locations (
  id bigserial primary key,
  equipment_type text not null,         -- family values
  series text,                          -- EFL-series, CPD-series, CQD/CQE, EPT-series, ES/ESR, JX-series, QDD-series
  location_notes text not null,         -- concise "where to look" + what to record
  created_at timestamptz default now()
);
create unique index if not exists ep_plate_unique
  on public.ep_plate_locations (equipment_type, coalesce(series,''), location_notes);

-- Optional: model-level serial notes (EP rarely publishes numeric ranges; we store text notes if found)
create table if not exists public.ep_model_serial_notes (
  id bigserial primary key,
  model_code text not null,             -- e.g., CQD16/20: "manual versions may change by serial; quote serial"
  note text not null,                   -- human-readable guidance
  created_at timestamptz default now()
);
create index if not exists ep_model_serial_notes_model_idx on public.ep_model_serial_notes (model_code);

-- RLS read-only
alter table public.ep_model_cues enable row level security;
alter table public.ep_plate_locations enable row level security;
alter table public.ep_model_serial_notes enable row level security;

-- Drop policies if they exist, then create them
drop policy if exists "ro_ep_cues" on public.ep_model_cues;
drop policy if exists "ro_ep_plates" on public.ep_plate_locations;
drop policy if exists "ro_ep_notes" on public.ep_model_serial_notes;

create policy "ro_ep_cues" on public.ep_model_cues for select using (true);
create policy "ro_ep_plates" on public.ep_plate_locations for select using (true);
create policy "ro_ep_notes" on public.ep_model_serial_notes for select using (true);
