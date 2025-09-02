-- Create exam persistence tables for paper/session management
-- Migration: create_exam_persistence_tables.sql

create extension if not exists pgcrypto;

-- Exam settings table for configurable parameters
create table if not exists public.exam_settings (
  id uuid primary key default gen_random_uuid(),
  pass_score integer not null default 80 check (pass_score between 0 and 100),
  time_limit_min integer not null default 30 check (time_limit_min > 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Insert default settings if none exist
insert into public.exam_settings (pass_score, time_limit_min) 
values (80, 30)
on conflict do nothing;

-- Exam papers table for persistent exam generation
create table if not exists public.exam_papers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid null,
  locale text not null check (locale in ('en', 'es')),
  item_ids jsonb not null default '[]'::jsonb,
  correct_indices jsonb not null default '[]'::jsonb,
  ttl_at timestamptz not null,
  created_at timestamptz default now()
);

-- Exam sessions table for progress tracking
create table if not exists public.exam_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  paper_id uuid not null references public.exam_papers(id) on delete cascade,
  answers jsonb not null default '[]'::jsonb,
  remaining_sec integer not null,
  status text not null check (status in ('in_progress', 'completed', 'expired')) default 'in_progress',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for performance
create index if not exists exam_papers_user_id_idx on public.exam_papers(user_id);
create index if not exists exam_papers_ttl_idx on public.exam_papers(ttl_at);
create index if not exists exam_sessions_user_id_idx on public.exam_sessions(user_id);
create index if not exists exam_sessions_status_idx on public.exam_sessions(status);
create index if not exists exam_sessions_paper_id_idx on public.exam_sessions(paper_id);

-- Enable Row Level Security
alter table public.exam_settings enable row level security;
alter table public.exam_papers enable row level security;
alter table public.exam_sessions enable row level security;

-- Create RLS policies
-- Exam settings: readable by authenticated users
create policy "exam_settings_read" on public.exam_settings
  for select to authenticated using (true);

-- Exam papers: users can only access their own
create policy "exam_papers_owner" on public.exam_papers
  for all to authenticated using (user_id = auth.uid());

-- Exam sessions: users can only access their own
create policy "exam_sessions_owner" on public.exam_sessions
  for all to authenticated using (user_id = auth.uid());

-- Service role can manage all exam data
create policy "exam_settings_admin" on public.exam_settings
  for all to service_role using (true);
create policy "exam_papers_admin" on public.exam_papers
  for all to service_role using (true);
create policy "exam_sessions_admin" on public.exam_sessions
  for all to service_role using (true);

-- Create function to update updated_at timestamp
create or replace function update_exam_sessions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for auto-updating timestamps
create trigger update_exam_sessions_updated_at
  before update on public.exam_sessions
  for each row
  execute function update_exam_sessions_updated_at();

-- Cleanup function for expired papers (run via cron)
create or replace function cleanup_expired_exam_papers()
returns void as $$
begin
  delete from public.exam_papers where ttl_at < now();
  update public.exam_sessions set status = 'expired' where status = 'in_progress' and paper_id not in (select id from public.exam_papers);
end;
$$ language plpgsql security definer;
