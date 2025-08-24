-- Cues map to families to aid inference
create table if not exists public.kubota_model_cues (
  cue text primary key,             -- e.g., KX057-5, U55-5, SVL75-3, SSV75, R540, L47, M62
  family text not null,             -- Compact Excavator, Compact Track Loader, Skid Steer Loader, Wheel Loader, Tractor Loader Backhoe
  notes text,
  example_models text,
  created_at timestamptz default now()
);

-- Plate/nameplate guidance from official FAQs/manual patterns
create table if not exists public.kubota_plate_locations (
  id bigserial primary key,
  equipment_type text not null,     -- family
  series text,                      -- KX-series, U-series, SVL-series, SSV-series, R-series, TLB-series
  location_notes text not null,     -- concise "where to look" + what to record
  created_at timestamptz default now()
);
create unique index if not exists kubota_plate_unique
  on public.kubota_plate_locations (equipment_type, coalesce(series,''), location_notes);

-- Model-level serial-number breaks (textual; cite notes internally)
create table if not exists public.kubota_model_serial_ranges (
  id bigserial primary key,
  model_code text not null,         -- e.g., U35 (SN 20000–29999), KX057-4 (From 25001)
  serial_range text not null,       -- e.g., "SN 20000–29999", "From 25001", "From 30666 (component group)"
  notes text,
  created_at timestamptz default now()
);
create index if not exists kubota_model_serial_ranges_model_idx on public.kubota_model_serial_ranges (model_code);

-- RLS read-only
alter table public.kubota_model_cues enable row level security;
alter table public.kubota_plate_locations enable row level security;
alter table public.kubota_model_serial_ranges enable row level security;

-- Drop policies if they exist, then create them
drop policy if exists "ro_kubota_cues" on public.kubota_model_cues;
drop policy if exists "ro_kubota_plates" on public.kubota_plate_locations;
drop policy if exists "ro_kubota_ranges" on public.kubota_model_serial_ranges;

create policy "ro_kubota_cues" on public.kubota_model_cues for select using (true);
create policy "ro_kubota_plates" on public.kubota_plate_locations for select using (true);
create policy "ro_kubota_ranges" on public.kubota_model_serial_ranges for select using (true);
