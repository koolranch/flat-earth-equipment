-- Enable pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- Final exam attempts table (percent stored 0–100)
create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  course_id uuid,
  score_pct numeric not null check (score_pct >= 0 and score_pct <= 100),
  passed boolean not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

-- Turn on Row Level Security
alter table public.exam_attempts enable row level security;

-- (Re)create policies — allow authenticated users to insert/select their own rows
drop policy if exists exam_attempts_owner_ins on public.exam_attempts;
create policy exam_attempts_owner_ins
on public.exam_attempts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists exam_attempts_owner_sel on public.exam_attempts;
create policy exam_attempts_owner_sel
on public.exam_attempts
for select
to authenticated
using (auth.uid() = user_id);

-- Helpful index for lookups
create index if not exists exam_attempts_user_created_idx
  on public.exam_attempts (user_id, created_at desc);
