create table if not exists public.sinoboom_model_cues (
  cue text primary key,        -- e.g., 1930SE, 1932ME, 2746E, TB20J Plus, AB16EJ Plus
  family text not null,        -- Scissor Lift, Telescopic Boom, Articulated Boom
  notes text,
  example_models text,
  created_at timestamptz default now()
);

create table if not exists public.sinoboom_plate_locations (
  id bigserial primary key,
  equipment_type text not null,  -- Scissor Lift, Telescopic Boom, Articulated Boom
  series text,                   -- e.g., 1530SE/1930SE/1532ME/1932ME, 2146E/2746E/3346E/4047E, TB Plus, AB EJ Plus
  location_notes text not null,  -- concise "where to look" + what to record
  created_at timestamptz default now()
);
create unique index if not exists sinoboom_plate_unique
  on public.sinoboom_plate_locations (equipment_type, coalesce(series,''), location_notes);

create table if not exists public.sinoboom_model_serial_ranges (
  id bigserial primary key,
  model_code text not null,      -- e.g., TB28J Plus
  serial_range text not null,    -- e.g., "From 0507000513 to present"
  notes text,
  created_at timestamptz default now()
);
create index if not exists sinoboom_ranges_model_idx on public.sinoboom_model_serial_ranges (model_code);

-- RLS read-only
alter table public.sinoboom_model_cues enable row level security;
alter table public.sinoboom_plate_locations enable row level security;
alter table public.sinoboom_model_serial_ranges enable row level security;

-- Drop policies if they exist, then create them
drop policy if exists "ro_sinoboom_cues" on public.sinoboom_model_cues;
drop policy if exists "ro_sinoboom_plates" on public.sinoboom_plate_locations;
drop policy if exists "ro_sinoboom_ranges" on public.sinoboom_model_serial_ranges;

create policy "ro_sinoboom_cues" on public.sinoboom_model_cues for select using (true);
create policy "ro_sinoboom_plates" on public.sinoboom_plate_locations for select using (true);
create policy "ro_sinoboom_ranges" on public.sinoboom_model_serial_ranges for select using (true);
