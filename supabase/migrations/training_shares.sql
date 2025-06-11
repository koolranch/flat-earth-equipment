-- Migration: Add training_shares table for certificate and evaluation sharing
-- Run this in Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS training_shares (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  course_id uuid references public.courses(id),
  supervisor_email text not null,
  shared_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE training_shares ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own shares
CREATE POLICY "training_shares_owner" ON training_shares
  FOR ALL USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE training_shares IS 'Tracks when users share certificates and evaluation forms with supervisors'; 