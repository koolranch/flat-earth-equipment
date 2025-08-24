create table if not exists public.tennant_model_cues (
  cue text primary key,            -- e.g., T300, T350, T12, T16, T20, S20, S30, M20, M30, B10
  family text not null,            -- Scrubber (Walk-behind/Stand-on), Scrubber (Rider), Sweeper (Rider), Sweeper-Scrubber (Rider), Burnisher
  notes text,
  example_models text,
  created_at timestamptz default now()
);

create table if not exists public.tennant_plate_locations (
  id bigserial primary key,
  equipment_type text not null,     -- family or specific line
  series text,                      -- e.g., T300/T300e, T350, T12, T16, T20, S20, S30, M20, M30, B10
  location_notes text not null,     -- concise 'where to look' + what to record
  created_at timestamptz default now()
);
create unique index if not exists tennant_plate_uni on public.tennant_plate_locations (equipment_type, coalesce(series,''), location_notes);

create table if not exists public.tennant_model_serial_notes (
  id bigserial primary key,
  model_code text not null,         -- e.g., T300, T350, S20, S30, M20, T20
  note text not null,
  created_at timestamptz default now()
);
create index if not exists tennant_model_serial_notes_idx on public.tennant_model_serial_notes (model_code);

create table if not exists public.tennant_model_serial_ranges (
  id bigserial primary key,
  model_code text not null,
  serial_range text not null,       -- e.g., 'S/N 000000–006500'
  notes text,
  created_at timestamptz default now()
);
create index if not exists tennant_model_serial_ranges_idx on public.tennant_model_serial_ranges (model_code);

create table if not exists public.tennant_user_submissions (
  id bigserial primary key,
  submitted_at timestamptz default now(),
  family text,
  model_input text,
  serial_input text,
  user_notes text
);

-- RLS read-only
alter table public.tennant_model_cues enable row level security;
alter table public.tennant_plate_locations enable row level security;
alter table public.tennant_model_serial_notes enable row level security;
alter table public.tennant_model_serial_ranges enable row level security;
alter table public.tennant_user_submissions enable row level security;

-- Drop policies if they exist, then create them
drop policy if exists "ro_tn_cues" on public.tennant_model_cues;
drop policy if exists "ro_tn_plates" on public.tennant_plate_locations;
drop policy if exists "ro_tn_notes" on public.tennant_model_serial_notes;
drop policy if exists "ro_tn_ranges" on public.tennant_model_serial_ranges;
drop policy if exists "ro_tn_subs" on public.tennant_user_submissions;

create policy "ro_tn_cues" on public.tennant_model_cues for select using (true);
create policy "ro_tn_plates" on public.tennant_plate_locations for select using (true);
create policy "ro_tn_notes" on public.tennant_model_serial_notes for select using (true);
create policy "ro_tn_ranges" on public.tennant_model_serial_ranges for select using (true);
create policy "ro_tn_subs" on public.tennant_user_submissions for select using (true);
