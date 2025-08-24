-- Model cues -> families
create table if not exists public.jh_model_cues (
  cue text primary key,       -- e.g., EFG, DFG, TFG, ETV, ETM, ETVQ, EJE, EJC, EJD, ERC, EKS, EKX
  family text not null,       -- Electric Counterbalance, IC Counterbalance, Reach Truck, Four-Way Reach, Pallet Truck, Stacker, Order Picker, VNA (Turret)
  notes text,
  example_models text,
  created_at timestamptz default now()
);

-- Plate/nameplate guidance by family/series
create table if not exists public.jh_plate_locations (
  id bigserial primary key,
  equipment_type text not null,   -- family
  series text,                    -- EFG, DFG/TFG, ETV/ETM, ETVQ, EJE, EJC/EJD/ERC, EKS, EKX
  location_notes text not null,   -- concise "where to look" + what to record
  created_at timestamptz default now()
);
create unique index if not exists jh_plate_unique
  on public.jh_plate_locations (equipment_type, coalesce(series,''), location_notes);

-- Model-level serial notes (text pulled from manuals; no decoding)
create table if not exists public.jh_model_serial_notes (
  id bigserial primary key,
  model_code text not null,      -- e.g., ETV 110–116, EKS 310, EFG 213–220
  note text not null,
  created_at timestamptz default now()
);
create index if not exists jh_model_serial_notes_model_idx on public.jh_model_serial_notes (model_code);

-- RLS read-only
alter table public.jh_model_cues enable row level security;
alter table public.jh_plate_locations enable row level security;
alter table public.jh_model_serial_notes enable row level security;

-- Drop policies if they exist, then create them
drop policy if exists "ro_jh_cues" on public.jh_model_cues;
drop policy if exists "ro_jh_plates" on public.jh_plate_locations;
drop policy if exists "ro_jh_notes" on public.jh_model_serial_notes;

create policy "ro_jh_cues" on public.jh_model_cues for select using (true);
create policy "ro_jh_plates" on public.jh_plate_locations for select using (true);
create policy "ro_jh_notes" on public.jh_model_serial_notes for select using (true);
