create table if not exists public.lull_model_cues (
  cue text primary key,                 -- e.g., 644E-42, 944E-42, 1044C-54 Series II
  family text not null,                 -- Telehandler
  notes text,
  example_models text,
  created_at timestamptz default now()
);

create table if not exists public.lull_plate_locations (
  id bigserial primary key,
  equipment_type text not null,        -- Telehandler
  series text,                         -- 644E-42 / 944E-42 / 1044C-54 Series II
  location_notes text not null,        -- where the machine serial plate is + what to record
  created_at timestamptz default now()
);
create unique index if not exists lull_plate_unique on public.lull_plate_locations (equipment_type, coalesce(series,''), location_notes);

create table if not exists public.lull_model_serial_notes (
  id bigserial primary key,
  model_code text not null,            -- e.g., 1044C-54 Series II
  note text not null,
  created_at timestamptz default now()
);
create index if not exists lull_model_serial_notes_model_idx on public.lull_model_serial_notes (model_code);

create table if not exists public.lull_model_serial_ranges (
  id bigserial primary key,
  model_code text not null,            -- e.g., 944E-42, 1044C-54 Series II
  serial_range text not null,          -- e.g., 'S/N 17569–20123; 0160002514–0160041827'
  notes text,
  created_at timestamptz default now()
);
create index if not exists lull_model_serial_ranges_model_idx on public.lull_model_serial_ranges (model_code);

create table if not exists public.lull_user_submissions (
  id bigserial primary key,
  submitted_at timestamptz default now(),
  model_input text,
  serial_input text,
  claimed_year int,
  user_notes text
);

-- RLS read-only
alter table public.lull_model_cues enable row level security;
alter table public.lull_plate_locations enable row level security;
alter table public.lull_model_serial_notes enable row level security;
alter table public.lull_model_serial_ranges enable row level security;
alter table public.lull_user_submissions enable row level security;

-- Drop policies if they exist, then create them
drop policy if exists "ro_lull_cues" on public.lull_model_cues;
drop policy if exists "ro_lull_plates" on public.lull_plate_locations;
drop policy if exists "ro_lull_notes" on public.lull_model_serial_notes;
drop policy if exists "ro_lull_ranges" on public.lull_model_serial_ranges;
drop policy if exists "ro_lull_subs" on public.lull_user_submissions;

create policy "ro_lull_cues" on public.lull_model_cues for select using (true);
create policy "ro_lull_plates" on public.lull_plate_locations for select using (true);
create policy "ro_lull_notes" on public.lull_model_serial_notes for select using (true);
create policy "ro_lull_ranges" on public.lull_model_serial_ranges for select using (true);
create policy "ro_lull_subs" on public.lull_user_submissions for select using (true);
