create table if not exists public.manitou_serial_lookup (
  id bigserial primary key,
  family text not null,
  model_code text,
  serial_rule text,
  rule_type text check (rule_type in ('prefix','range','heuristic','none')) default 'none',
  disclaimer text,
  source_ids text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists public.manitou_model_aliases (
  id bigserial primary key,
  family text not null,
  alias text not null,
  normalized text not null
);

create table if not exists public.manitou_plate_locations (
  id bigserial primary key,
  family text not null,
  component text not null,
  location_note text not null,
  created_at timestamptz default now()
);

create table if not exists public.manitou_user_submissions (
  id bigserial primary key,
  submitted_at timestamptz default now(),
  family text not null,
  model_input text,
  serial_input text,
  claimed_year int,
  user_notes text
);

alter table public.manitou_serial_lookup enable row level security;
alter table public.manitou_model_aliases enable row level security;
alter table public.manitou_plate_locations enable row level security;
alter table public.manitou_user_submissions enable row level security;

-- Drop policies if they exist, then create them
drop policy if exists "ro_serial" on public.manitou_serial_lookup;
drop policy if exists "ro_aliases" on public.manitou_model_aliases;
drop policy if exists "ro_plates" on public.manitou_plate_locations;
drop policy if exists "ro_subs" on public.manitou_user_submissions;

create policy "ro_serial" on public.manitou_serial_lookup for select using (true);
create policy "ro_aliases" on public.manitou_model_aliases for select using (true);
create policy "ro_plates" on public.manitou_plate_locations for select using (true);
create policy "ro_subs" on public.manitou_user_submissions for select using (true);
