create table if not exists public.hc_model_cues (
  cue text primary key,                -- e.g., CPD, CPCD, CPQ, CQD, CBD, CDD, CJD
  family text not null,                -- Electric Counterbalance, IC Counterbalance (Diesel/LPG), Reach Truck, Pallet Truck, Stacker, Order Picker
  notes text,
  example_models text,
  created_at timestamptz default now()
);

create table if not exists public.hc_plate_locations (
  id bigserial primary key,
  equipment_type text not null,        -- family
  series text,                         -- e.g., A/X/XC/XH series; R/XF series; CQD; CBD; CDD; CJD
  location_notes text not null,        -- concise 'where to look' + what to record
  created_at timestamptz default now()
);
create unique index if not exists hc_plate_unique on public.hc_plate_locations (equipment_type, coalesce(series,''), location_notes);

create table if not exists public.hc_model_serial_notes (
  id bigserial primary key,
  model_code text not null,            -- e.g., CPD25-XC, CPCD30-XF, CQD16, CBD20, CDD16, CJD12
  note text not null,
  created_at timestamptz default now()
);
create index if not exists hc_model_serial_notes_model_idx on public.hc_model_serial_notes (model_code);

create table if not exists public.hc_model_serial_ranges (
  id bigserial primary key,
  model_code text not null,
  serial_range text not null,
  notes text,
  created_at timestamptz default now()
);
create index if not exists hc_model_serial_ranges_model_idx on public.hc_model_serial_ranges (model_code);

alter table public.hc_model_cues enable row level security;
alter table public.hc_plate_locations enable row level security;
alter table public.hc_model_serial_notes enable row level security;
alter table public.hc_model_serial_ranges enable row level security;

-- Drop policies if they exist, then create them
drop policy if exists "ro_hc_cues" on public.hc_model_cues;
drop policy if exists "ro_hc_plates" on public.hc_plate_locations;
drop policy if exists "ro_hc_notes" on public.hc_model_serial_notes;
drop policy if exists "ro_hc_ranges" on public.hc_model_serial_ranges;

create policy "ro_hc_cues" on public.hc_model_cues for select using (true);
create policy "ro_hc_plates" on public.hc_plate_locations for select using (true);
create policy "ro_hc_notes" on public.hc_model_serial_notes for select using (true);
create policy "ro_hc_ranges" on public.hc_model_serial_ranges for select using (true);
