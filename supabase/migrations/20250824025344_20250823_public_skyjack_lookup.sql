-- Model cues → families
create table if not exists public.skyjack_model_cues (
  cue text primary key,                  -- e.g., SJ3219, SJ3226, SJ4632, SJ63AJ, SJ45T, SJ12, SJ9233 RT
  family text not null,                  -- Scissor Lift, Rough-Terrain Scissor, Articulating Boom, Telescopic Boom, Vertical Mast
  notes text,
  example_models text,
  created_at timestamptz default now()
);

-- Plate/nameplate guidance by family/series
create table if not exists public.skyjack_plate_locations (
  id bigserial primary key,
  equipment_type text not null,          -- family
  series text,                           -- e.g., SJ3xxx (compact scissor), RT Scissor, AJ (articulating), T (telescopic), SJ12/16/20E
  location_notes text not null,          -- concise "where to look" + what to record
  created_at timestamptz default now()
);
create unique index if not exists skyjack_plate_unique
  on public.skyjack_plate_locations (equipment_type, coalesce(series,''), location_notes);

-- Published serial ranges (textual; no decoding)
create table if not exists public.skyjack_model_serial_ranges (
  id bigserial primary key,
  model_code text not null,              -- e.g., SJIII 3219; SJ3226; SJ63AJ; SJ45T; SJ8831 RT
  serial_range text not null,            -- e.g., "22,057,772–22,999,999", "95,300,481 & above"
  notes text,
  created_at timestamptz default now()
);
create index if not exists skyjack_model_serial_ranges_model_idx on public.skyjack_model_serial_ranges (model_code);

-- RLS read-only
alter table public.skyjack_model_cues enable row level security;
alter table public.skyjack_plate_locations enable row level security;
alter table public.skyjack_model_serial_ranges enable row level security;

-- Drop policies if they exist, then create them
drop policy if exists "ro_sj_cues" on public.skyjack_model_cues;
drop policy if exists "ro_sj_plates" on public.skyjack_plate_locations;
drop policy if exists "ro_sj_ranges" on public.skyjack_model_serial_ranges;

create policy "ro_sj_cues" on public.skyjack_model_cues for select using (true);
create policy "ro_sj_plates" on public.skyjack_plate_locations for select using (true);
create policy "ro_sj_ranges" on public.skyjack_model_serial_ranges for select using (true);
