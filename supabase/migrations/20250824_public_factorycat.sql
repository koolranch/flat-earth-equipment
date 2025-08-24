create table if not exists public.factorycat_model_cues (
  cue text primary key,             -- e.g., MICROMAG, MICROMINI, MINI-HD, MAG-HD, GTX, GTR, XR, PILOT, 34, TR
  family text not null,             -- Walk-behind Scrubber, Rider Scrubber, Rider Sweeper, Walk-behind Sweeper
  notes text,
  example_models text,
  created_at timestamptz default now()
);

create table if not exists public.factorycat_plate_locations (
  id bigserial primary key,
  equipment_type text not null,      -- family or line
  series text,                       -- e.g., MICROMAG, MICROMINI, MAG-HD, MINI-HD, XR, GTX, GTR, PILOT, 34, TR
  location_notes text not null,      -- where the serial/data plate is + what to record
  created_at timestamptz default now()
);
create unique index if not exists factorycat_plate_uni on public.factorycat_plate_locations (equipment_type, coalesce(series,''), location_notes);

create table if not exists public.factorycat_model_serial_notes (
  id bigserial primary key,
  model_code text not null,          -- e.g., MICROMAG, MICROMINI, MAG-HD, MINI-HD, XR, GTX, GTR, 34, TR
  note text not null,
  created_at timestamptz default now()
);
create index if not exists factorycat_model_serial_notes_idx on public.factorycat_model_serial_notes (model_code);

create table if not exists public.factorycat_model_serial_ranges (
  id bigserial primary key,
  model_code text not null,          -- model or series name
  serial_range text not null,        -- e.g., '≤56483', '≥56484', '≥94937', '≥57313'
  notes text,
  created_at timestamptz default now()
);
create index if not exists factorycat_model_serial_ranges_idx on public.factorycat_model_serial_ranges (model_code);

create table if not exists public.factorycat_user_submissions (
  id bigserial primary key,
  submitted_at timestamptz default now(),
  family text,
  model_input text,
  serial_input text,
  user_notes text
);

-- RLS read-only
alter table public.factorycat_model_cues enable row level security;
alter table public.factorycat_plate_locations enable row level security;
alter table public.factorycat_model_serial_notes enable row level security;
alter table public.factorycat_model_serial_ranges enable row level security;
alter table public.factorycat_user_submissions enable row level security;

create policy if not exists "ro_fc_cues"   on public.factorycat_model_cues          for select using (true);
create policy if not exists "ro_fc_plates" on public.factorycat_plate_locations     for select using (true);
create policy if not exists "ro_fc_notes"  on public.factorycat_model_serial_notes for select using (true);
create policy if not exists "ro_fc_ranges" on public.factorycat_model_serial_ranges for select using (true);
create policy if not exists "ro_fc_subs"   on public.factorycat_user_submissions   for select using (true);
