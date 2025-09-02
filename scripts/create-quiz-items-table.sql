-- Simple SQL to create quiz_items table
-- Run this if the table doesn't exist yet

create table if not exists public.quiz_items (
  id uuid primary key default gen_random_uuid(),
  module_slug text not null,
  locale text not null check (locale in ('en', 'es')),
  question text not null,
  choices jsonb not null default '[]'::jsonb,
  correct_index integer not null,
  explain text,
  difficulty integer check (difficulty between 1 and 5),
  tags jsonb default '[]'::jsonb,
  is_exam_candidate boolean default false,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for performance
create index if not exists quiz_items_module_locale_idx on public.quiz_items(module_slug, locale);
create index if not exists quiz_items_active_idx on public.quiz_items(active);
create index if not exists quiz_items_exam_candidate_idx on public.quiz_items(is_exam_candidate);

-- Enable Row Level Security
alter table public.quiz_items enable row level security;

-- Allow authenticated users to read active quiz items
create policy if not exists "quiz_items_read" on public.quiz_items
  for select to authenticated using (active = true);

-- Allow service role to manage quiz items (for admin/seeding)
create policy if not exists "quiz_items_admin" on public.quiz_items
  for all to service_role using (true);
