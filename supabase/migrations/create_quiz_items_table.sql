-- Create quiz_items table for dynamic quiz content
-- Migration: create_quiz_items_table.sql

create extension if not exists pgcrypto;

-- Create quiz_items table
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
create index if not exists quiz_items_difficulty_idx on public.quiz_items(difficulty);

-- Enable Row Level Security
alter table public.quiz_items enable row level security;

-- Create RLS policies
-- Allow authenticated users to read active quiz items
create policy "quiz_items_read" on public.quiz_items
  for select to authenticated using (active = true);

-- Allow service role to manage quiz items (for admin/seeding)
create policy "quiz_items_admin" on public.quiz_items
  for all to service_role using (true);

-- Create function to update updated_at timestamp
create or replace function update_quiz_items_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for auto-updating timestamps
create trigger update_quiz_items_updated_at
  before update on public.quiz_items
  for each row
  execute function update_quiz_items_updated_at();
