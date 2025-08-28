-- Add quiz attempts tracking and enrollment resume state
-- Migration: 20250828085753_add_quiz_attempts_and_resume_state.sql

create extension if not exists pgcrypto;

-- 1) quiz_attempts
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  module_id uuid references public.modules(id) on delete set null,
  mode text not null check (mode in ('full','retry')) default 'full',
  seed text not null,
  question_ids jsonb not null default '[]'::jsonb,
  incorrect_ids jsonb not null default '[]'::jsonb,
  correct_count int not null default 0,
  total_count int not null default 0,
  score numeric not null default 0,
  passed boolean,
  created_at timestamptz not null default now()
);
create index if not exists quiz_attempts_user_idx on public.quiz_attempts(user_id);
create index if not exists quiz_attempts_module_idx on public.quiz_attempts(module_id);

-- 2) enrollments.resume_state (stores next route)
alter table public.enrollments add column if not exists resume_state jsonb default '{}'::jsonb;

-- 3) RLS
alter table public.quiz_attempts enable row level security;
create policy if not exists qa_select on public.quiz_attempts for select to authenticated using (user_id = auth.uid());
create policy if not exists qa_insert on public.quiz_attempts for insert to authenticated with check (user_id = auth.uid());
create policy if not exists qa_update on public.quiz_attempts for update to authenticated using (user_id = auth.uid());

-- helper: set resume pointer on enrollment (SECURITY DEFINER)
create or replace function public.set_resume(p_enrollment uuid, p_state jsonb)
returns void language sql security definer as $$
  update public.enrollments set resume_state = coalesce(p_state,'{}'::jsonb) where id = p_enrollment;
$$;
comment on function public.set_resume(uuid, jsonb) is 'Save resume pointer on enrollment';
