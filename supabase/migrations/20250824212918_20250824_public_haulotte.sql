create table if not exists public.haulotte_model_cues (
  cue text primary key,            -- e.g., HA, HT, COMPACT, OPTIMUM, STAR, HTA
  family text not null,            -- Articulating Boom, Telescopic Boom, Scissor (Electric), Scissor (RT), Vertical Mast, Trailer Boom
  notes text,
  example_models text,
  created_at timestamptz default now()
);

create table if not exists public.haulotte_plate_locations (
  id bigserial primary key,
  equipment_type text not null,     -- family
  series text,                      -- e.g., HA RTJ, HT RTJ, COMPACT DX, OPTIMUM, STAR 10/26J, HTA trailers
  location_notes text not null,     -- where the ID plate/serial is, and what to record
  created_at timestamptz default now()
);
create unique index if not exists haulotte_plate_uni on public.haulotte_plate_locations (equipment_type, coalesce(series,''), location_notes);

create table if not exists public.haulotte_model_serial_notes (
  id bigserial primary key,
  model_code text not null,         -- e.g., HA16 RTJ PRO, HT67 RTJ PRO, COMPACT 12, OPTIMUM 1931E, STAR 10, HTA16P
  note text not null,
  created_at timestamptz default now()
);
create index if not exists haulotte_model_serial_notes_idx on public.haulotte_model_serial_notes (model_code);

create table if not exists public.haulotte_user_submissions (
  id bigserial primary key,
  submitted_at timestamptz default now(),
  family text,
  model_input text,
  serial_input text,
  user_notes text
);

alter table public.haulotte_model_cues enable row level security;
alter table public.haulotte_plate_locations enable row level security;
alter table public.haulotte_model_serial_notes enable row level security;
alter table public.haulotte_user_submissions enable row level security;

-- Drop policies if they exist, then create them
drop policy if exists "ro_hl_cues" on public.haulotte_model_cues;
drop policy if exists "ro_hl_plates" on public.haulotte_plate_locations;
drop policy if exists "ro_hl_notes" on public.haulotte_model_serial_notes;
drop policy if exists "ro_hl_subs" on public.haulotte_user_submissions;

create policy "ro_hl_cues" on public.haulotte_model_cues for select using (true);
create policy "ro_hl_plates" on public.haulotte_plate_locations for select using (true);
create policy "ro_hl_notes" on public.haulotte_model_serial_notes for select using (true);
create policy "ro_hl_subs" on public.haulotte_user_submissions for select using (true);
