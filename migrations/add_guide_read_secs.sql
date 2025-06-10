-- Add guide reading time tracking to enrollments table
alter table public.enrollments
add column if not exists guide_read_secs integer default 0; 