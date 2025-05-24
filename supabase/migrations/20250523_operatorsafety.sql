-- enable crypto for UUIDs
create extension if not exists pgcrypto;

-- COURSES  ▸ one row per sellable course (forklift, mewp, etc.)
create table public.courses (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  description   text,
  price_cents   integer not null,
  stripe_price  text unique,          -- FK to Stripe Price.id
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
-- anyone can read courses
alter table public.courses enable row level security;
create policy "courses_read" on public.courses
  for select using ( true );

-- MODULES  ▸ video/quiz children of a course
create table public.modules (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid references public.courses(id) on delete cascade,
  "order"       integer,
  title         text not null,
  video_url     text,
  quiz_json     jsonb,
  created_at    timestamptz default now()
);
alter table public.modules enable row level security;
create policy "modules_read" on public.modules for select using ( true );

-- ORDERS  ▸ Stripe session metadata
create table public.orders (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users(id),
  course_id          uuid references public.courses(id),
  stripe_session_id  text unique,
  seats              integer default 1,
  amount_cents       integer,
  created_at         timestamptz default now()
);
alter table public.orders enable row level security;
create policy "orders_owner" on public.orders
  for all using ( auth.uid() = user_id );

-- ENROLLMENTS  ▸ progress + certificate
create table public.enrollments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id),
  course_id     uuid references public.courses(id),
  progress_pct  real default 0,
  passed        boolean default false,
  cert_url      text,
  expires_at    timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
alter table public.enrollments enable row level security;
create policy "enroll_owner" on public.enrollments
  for all using ( auth.uid() = user_id );

-- COMPANY_SEATS  ▸ optional bulk-license mapping
create table public.company_seats (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid,                      -- you'll add a companies table later
  enrollment_id uuid references public.enrollments(id) on delete cascade
);
alter table public.company_seats enable row level security;

-- STORAGE buckets (all private by default)
insert into storage.buckets (id, name, public)
values 
  ('videos', 'videos', false),
  ('certs', 'certs', false),
  ('marketing', 'marketing', true)
on conflict (id) do nothing; 