-- Model cues → families (for inference)
create table if not exists public.case_model_cues (
  cue text primary key,        -- 580N, 590SN, 580SN WT, SR, SV, TR, TV, CX, CX145D, CX210D, 521G, 621G, 721G, 821G, 921G, 1021G, 1121G, 650M, 750M, 850M, 1150M, 1650M, 2050M, CX17C, CX26C, CX37C, CX57C, CX60C
  family text not null,        -- Backhoe Loader, Skid Steer / CTL, Crawler Excavator, Wheel Loader, Crawler Dozer, Mini Excavator
  notes text,
  example_models text,
  created_at timestamptz default now()
);

-- Plate/stamped-serial locations (by equipment type + series)
create table if not exists public.case_plate_locations (
  id bigserial primary key,
  equipment_type text not null,   -- Backhoe Loader, Skid Steer / CTL, Crawler Excavator, Wheel Loader, Crawler Dozer, Mini Excavator
  series text,                    -- e.g., 580N/590SN, SR/SV/TR/TV, CX (D-series), G-series WL, M-series Dozer, CX C-series mini
  location_notes text not null,
  created_at timestamptz default now()
);
create unique index if not exists case_plate_unique
  on public.case_plate_locations (equipment_type, coalesce(series,''), location_notes);

-- VIN/PIN 10th-character → year (true 17-char VIN/PIN ONLY)
create table if not exists public.case_vin_year_map (
  code char(1) primary key,
  year int not null check (year between 1980 and 2030)
);

-- Optional: series advisory notes for UI
create table if not exists public.case_series_examples (
  code text primary key,          -- e.g., 580N/590SN, SR/SV/TR/TV, CX D-series, G-series WL, 850M+, CX C-series mini
  example_note text not null
);

-- RLS read-only
alter table public.case_model_cues enable row level security;
alter table public.case_plate_locations enable row level security;
alter table public.case_vin_year_map enable row level security;
alter table public.case_series_examples enable row level security;

drop policy if exists "ro_case_cues" on public.case_model_cues;
create policy "ro_case_cues" on public.case_model_cues for select using (true);

drop policy if exists "ro_case_plates" on public.case_plate_locations;
create policy "ro_case_plates" on public.case_plate_locations for select using (true);

drop policy if exists "ro_case_vinmap" on public.case_vin_year_map;
create policy "ro_case_vinmap" on public.case_vin_year_map for select using (true);

drop policy if exists "ro_case_series" on public.case_series_examples;
create policy "ro_case_series" on public.case_series_examples for select using (true);
