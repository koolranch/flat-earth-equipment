-- Model prefixes / cues → families (for UI inference)
create table if not exists public.jcb_model_cues (
  cue text primary key,        -- 3CX, 4CX, LOADALL, 531-70, 535-95, 540-170, JS, 220X, 150T, 190T, 3TS, 411, 427, 457, TM
  family text not null,        -- Backhoe Loader, Telehandler (Loadall), Excavator, Skid Steer / CTL, Wheel Loader, Telescopic Wheel Loader
  notes text,
  example_models text,
  created_at timestamptz default now()
);

-- Plate / stamped-serial locations by equipment type + series
create table if not exists public.jcb_plate_locations (
  id bigserial primary key,
  equipment_type text not null,     -- Backhoe Loader, Telehandler (Loadall), Excavator, Skid Steer / CTL, Wheel Loader, Telescopic Wheel Loader
  series text,                      -- e.g., 3CX/4CX, 531–70/535–95/540–170, JS/220X, 150T/190T/3TS, 411/427/457, TM320/321
  location_notes text not null,     -- concise, UI-friendly
  created_at timestamptz default now()
);
create unique index if not exists jcb_plate_unique
  on public.jcb_plate_locations (equipment_type, coalesce(series,''), location_notes);

-- VIN/PIN 10th-character → year (apply ONLY to true 17-char VIN/PIN)
create table if not exists public.jcb_vin_year_map (
  code char(1) primary key,
  year int not null check (year between 1980 and 2030)
);

-- Optional: series advisory notes
create table if not exists public.jcb_series_examples (
  code text primary key,            -- e.g., 3CX/4CX, 531-70, JS220, 220X, 150T/190T/3TS, 411/427/457, TM320
  example_note text not null
);

-- RLS read-only
alter table public.jcb_model_cues enable row level security;
alter table public.jcb_plate_locations enable row level security;
alter table public.jcb_vin_year_map enable row level security;
alter table public.jcb_series_examples enable row level security;

create policy if not exists "ro_jcb_cues"    on public.jcb_model_cues        for select using (true);
create policy if not exists "ro_jcb_plates"  on public.jcb_plate_locations   for select using (true);
create policy if not exists "ro_jcb_vinmap"  on public.jcb_vin_year_map      for select using (true);
create policy if not exists "ro_jcb_series"  on public.jcb_series_examples   for select using (true);
