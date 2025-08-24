-- Map cues → families for inference
create table if not exists public.xcmg_model_cues (
  cue text primary key,            -- e.g., XE210C, XE55U, ZL50GN, XC958U, XS183, XD120, XP165U, XG1930AC, XGS50E, XGA16
  family text not null,            -- Excavator, Wheel Loader, Roller (Single Drum), Roller (Tandem), Roller (Pneumatic), Motor Grader, MEWP (Scissor), MEWP (Telescopic), MEWP (Articulated)
  notes text,
  example_models text,
  created_at timestamptz default now()
);

-- Plate/label guidance by family/series (concise, manual-backed phrasing)
create table if not exists public.xcmg_plate_locations (
  id bigserial primary key,
  equipment_type text not null,    -- same values as family
  series text,                     -- optional sub-family cues (e.g., XE series, XD/XS/XP, XG/XGS/XGA)
  location_notes text not null,    -- where to look + what to record (PIN + engine serial when applicable)
  created_at timestamptz default now()
);
create unique index if not exists xcmg_plate_unique
  on public.xcmg_plate_locations (equipment_type, coalesce(series,''), location_notes);

-- Optional: per-model serial range blocks (rarely published; placeholder for future)
create table if not exists public.xcmg_model_serial_ranges (
  id bigserial primary key,
  model_code text not null,        -- e.g., XG1930AC
  serial_range text not null,      -- textual range if known
  notes text,
  created_at timestamptz default now()
);
create index if not exists xcmg_model_serial_ranges_model_idx on public.xcmg_model_serial_ranges (model_code);

-- RLS read-only
alter table public.xcmg_model_cues enable row level security;
alter table public.xcmg_plate_locations enable row level security;
alter table public.xcmg_model_serial_ranges enable row level security;

drop policy if exists "ro_xcmg_cues" on public.xcmg_model_cues;
create policy "ro_xcmg_cues" on public.xcmg_model_cues for select using (true);

drop policy if exists "ro_xcmg_plates" on public.xcmg_plate_locations;
create policy "ro_xcmg_plates" on public.xcmg_plate_locations for select using (true);

drop policy if exists "ro_xcmg_ranges" on public.xcmg_model_serial_ranges;
create policy "ro_xcmg_ranges" on public.xcmg_model_serial_ranges for select using (true);
