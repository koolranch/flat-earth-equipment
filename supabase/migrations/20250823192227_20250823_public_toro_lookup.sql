-- Model cues → families (for inference in UI/API)
create table if not exists public.toro_model_cues (
  cue text primary key,        -- TXL 2000, TX 1000, TX 427, TX 525, 323, e-Dingo 500, MB TX 2500, MB TX 2500S, MB-1600
  family text not null,        -- Compact Utility Loader (Dingo), Telescoping Track Loader, Material Buggy
  notes text,
  example_models text,
  created_at timestamptz default now()
);

-- Plate/decal locations by equipment type + series
create table if not exists public.toro_plate_locations (
  id bigserial primary key,
  equipment_type text not null,   -- Compact Utility Loader (Dingo), Telescoping Track Loader, Material Buggy
  series text,                    -- e.g., Dingo TX (classic), TXL 2000, e-Dingo 500, MB TX 2500/2500S, MB-1600
  location_notes text not null,   -- concise, safe notes per manuals
  created_at timestamptz default now()
);
create unique index if not exists toro_plate_unique
  on public.toro_plate_locations (equipment_type, coalesce(series,''), location_notes);

-- Known serial-range blocks from Toro parts pages (per model number)
create table if not exists public.toro_model_serial_ranges (
  id bigserial primary key,
  model_number text not null,     -- e.g., 22218 (e-Dingo 500)
  serial_range text not null,     -- e.g., "400000000–407099999"
  notes text,
  created_at timestamptz default now()
);
create index if not exists toro_model_serial_ranges_model_idx on public.toro_model_serial_ranges (model_number);

-- RLS read-only
alter table public.toro_model_cues enable row level security;
alter table public.toro_plate_locations enable row level security;
alter table public.toro_model_serial_ranges enable row level security;

drop policy if exists "ro_toro_cues" on public.toro_model_cues;
create policy "ro_toro_cues" on public.toro_model_cues for select using (true);

drop policy if exists "ro_toro_plates" on public.toro_plate_locations;
create policy "ro_toro_plates" on public.toro_plate_locations for select using (true);

drop policy if exists "ro_toro_ranges" on public.toro_model_serial_ranges;
create policy "ro_toro_ranges" on public.toro_model_serial_ranges for select using (true);
