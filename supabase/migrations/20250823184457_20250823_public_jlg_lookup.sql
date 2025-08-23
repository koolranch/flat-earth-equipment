-- Model prefixes → families to guide UI (keep broad and conservative)
create table if not exists public.jlg_model_prefixes (
  prefix text primary key,      -- S, SJ, A, AJ, E, M, ES, AE, RT, R, T, TOUCAN
  family text not null,         -- Telescopic Boom, Articulating Boom, Electric Scissor (Slab), RT Scissor, Mast/Toucan, Telehandler
  notes text,
  example_models text,
  created_at timestamptz default now()
);

-- Plate / stamped-serial locations (by equipment type + series)
create table if not exists public.jlg_plate_locations (
  id bigserial primary key,
  equipment_type text not null,   -- Boom Lift (Telescopic), Boom Lift (Articulating), Scissor (ES/E2/E3), Scissor (RT), Telehandler
  series text,                    -- e.g., 450AJ/600S/660SJ, E2/E3/ES, 3394/4394RT, 642/742/943/1043/1055/1255
  location_notes text not null,
  created_at timestamptz default now()
);
create unique index if not exists jlg_plate_unique
  on public.jlg_plate_locations (equipment_type, coalesce(series,''), location_notes);

-- ES country-of-manufacture prefixes (from JLG parts/ops docs)
create table if not exists public.jlg_es_country_prefix (
  prefix text primary key,        -- 02, 12, B2, M2, A2
  country text not null,          -- USA, Belgium, China, Mexico, France
  notes text
);

-- VIN 10th-character → year (apply ONLY to true 17-char VIN/PIN)
create table if not exists public.jlg_vin_year_map (
  code char(1) primary key,
  year int not null check (year between 1980 and 2030)
);

-- RLS read-only
alter table public.jlg_model_prefixes enable row level security;
alter table public.jlg_plate_locations enable row level security;
alter table public.jlg_es_country_prefix enable row level security;
alter table public.jlg_vin_year_map enable row level security;

drop policy if exists "ro_jlg_prefixes" on public.jlg_model_prefixes;
drop policy if exists "ro_jlg_plates" on public.jlg_plate_locations;
drop policy if exists "ro_jlg_es_cp" on public.jlg_es_country_prefix;
drop policy if exists "ro_jlg_vinmap" on public.jlg_vin_year_map;

create policy "ro_jlg_prefixes" on public.jlg_model_prefixes for select using (true);
create policy "ro_jlg_plates" on public.jlg_plate_locations for select using (true);
create policy "ro_jlg_es_cp" on public.jlg_es_country_prefix for select using (true);
create policy "ro_jlg_vinmap" on public.jlg_vin_year_map for select using (true);
