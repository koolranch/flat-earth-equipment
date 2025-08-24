-- Model cues → families
create table if not exists public.hy_model_cues (
  cue text primary key,                -- e.g., 25B-9U, 20BT-9U, 15BRJ-9, 15BRP-9, 25L-9A, 50D-9
  family text not null,                -- Electric Counterbalance, IC Counterbalance, Reach Truck, Order Picker, Pallet/Stacker
  notes text,
  example_models text,
  created_at timestamptz default now()
);

-- Plate/nameplate guidance by family/series
create table if not exists public.hy_plate_locations (
  id bigserial primary key,
  equipment_type text not null,        -- family
  series text,                         -- e.g., BT/B/BC-9U; D-9; L-7A/9A; BR/BRJ/BRP/BR-X
  location_notes text not null,        -- concise "where to look" + what to record
  created_at timestamptz default now()
);
create unique index if not exists hy_plate_unique
  on public.hy_plate_locations (equipment_type, coalesce(series,''), location_notes);

-- Model-level serial/location notes (textual; no decoding)
create table if not exists public.hy_model_serial_notes (
  id bigserial primary key,
  model_code text not null,            -- e.g., 50D-9/60D-9/70D-9/80D-9; 15/18/20BT-9U; 25B-9U; 15BRJ-9
  note text not null,
  created_at timestamptz default now()
);
create index if not exists hy_model_serial_notes_model_idx on public.hy_model_serial_notes (model_code);

-- Optional: published serial ranges (rare; safe to keep empty initially)
create table if not exists public.hy_model_serial_ranges (
  id bigserial primary key,
  model_code text not null,
  serial_range text not null,
  notes text,
  created_at timestamptz default now()
);
create index if not exists hy_model_serial_ranges_model_idx on public.hy_model_serial_ranges (model_code);

-- RLS read-only
alter table public.hy_model_cues enable row level security;
alter table public.hy_plate_locations enable row level security;
alter table public.hy_model_serial_notes enable row level security;
alter table public.hy_model_serial_ranges enable row level security;

-- Drop policies if they exist, then create them
drop policy if exists "ro_hy_cues" on public.hy_model_cues;
drop policy if exists "ro_hy_plates" on public.hy_plate_locations;
drop policy if exists "ro_hy_notes" on public.hy_model_serial_notes;
drop policy if exists "ro_hy_ranges" on public.hy_model_serial_ranges;

create policy "ro_hy_cues" on public.hy_model_cues for select using (true);
create policy "ro_hy_plates" on public.hy_plate_locations for select using (true);
create policy "ro_hy_notes" on public.hy_model_serial_notes for select using (true);
create policy "ro_hy_ranges" on public.hy_model_serial_ranges for select using (true);
