-- Migration: Add missing columns to seat_invites and create seat_claims table
-- Date: November 1, 2025
-- Purpose: Support multi-seat training package purchases and seat assignment
-- Safety: Only ADDS columns, never drops or modifies existing data

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================================
-- SEAT_INVITES: Add missing tracking columns (safe - only adds if missing)
-- =====================================================================

-- Create base table if it doesn't exist (in case this is a new deployment)
CREATE TABLE IF NOT EXISTS public.seat_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  email TEXT NOT NULL CHECK (position('@' in email) > 1),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns safely (IF NOT EXISTS equivalent for columns)
DO $$ 
BEGIN
  -- Add invite_token column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'seat_invites' 
                 AND column_name = 'invite_token') THEN
    ALTER TABLE public.seat_invites ADD COLUMN invite_token TEXT UNIQUE;
  END IF;

  -- Add expires_at column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'seat_invites' 
                 AND column_name = 'expires_at') THEN
    ALTER TABLE public.seat_invites ADD COLUMN expires_at TIMESTAMPTZ;
  END IF;

  -- Add note column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'seat_invites' 
                 AND column_name = 'note') THEN
    ALTER TABLE public.seat_invites ADD COLUMN note TEXT;
  END IF;

  -- Add sent_at column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'seat_invites' 
                 AND column_name = 'sent_at') THEN
    ALTER TABLE public.seat_invites ADD COLUMN sent_at TIMESTAMPTZ;
  END IF;

  -- Add claimed_at column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'seat_invites' 
                 AND column_name = 'claimed_at') THEN
    ALTER TABLE public.seat_invites ADD COLUMN claimed_at TIMESTAMPTZ;
  END IF;

  -- Add claimed_by column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'seat_invites' 
                 AND column_name = 'claimed_by') THEN
    ALTER TABLE public.seat_invites ADD COLUMN claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Update status constraint to include all valid statuses (safe - only expands check)
DO $$
BEGIN
  -- Drop old constraint if exists and recreate with all statuses
  ALTER TABLE public.seat_invites DROP CONSTRAINT IF EXISTS seat_invites_status_check;
  ALTER TABLE public.seat_invites ADD CONSTRAINT seat_invites_status_check 
    CHECK (status IN ('pending', 'sent', 'claimed', 'failed', 'expired'));
EXCEPTION WHEN OTHERS THEN
  -- Constraint might not exist or might be different, that's ok
  NULL;
END $$;

-- Add unique constraint if missing (prevents duplicate invites)
DO $$
BEGIN
  ALTER TABLE public.seat_invites 
    ADD CONSTRAINT seat_invites_created_by_course_id_email_key 
    UNIQUE(created_by, course_id, email);
EXCEPTION WHEN duplicate_table THEN
  -- Constraint already exists, that's fine
  NULL;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_seat_invites_created_by ON public.seat_invites(created_by);
CREATE INDEX IF NOT EXISTS idx_seat_invites_course_id ON public.seat_invites(course_id);
CREATE INDEX IF NOT EXISTS idx_seat_invites_email ON public.seat_invites(email);
CREATE INDEX IF NOT EXISTS idx_seat_invites_token ON public.seat_invites(invite_token) WHERE invite_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_seat_invites_status ON public.seat_invites(status);

-- =====================================================================
-- SEAT_CLAIMS: Track which users have claimed seats from orders
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.seat_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One user can only claim one seat per order
  UNIQUE(order_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_seat_claims_order_id ON public.seat_claims(order_id);
CREATE INDEX IF NOT EXISTS idx_seat_claims_user_id ON public.seat_claims(user_id);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Enable RLS
ALTER TABLE public.seat_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_claims ENABLE ROW LEVEL SECURITY;

-- SEAT_INVITES Policies (DROP IF EXISTS to prevent conflicts)
DROP POLICY IF EXISTS seat_invites_select_own ON public.seat_invites;
CREATE POLICY seat_invites_select_own ON public.seat_invites
  FOR SELECT TO authenticated
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS seat_invites_insert_own ON public.seat_invites;
CREATE POLICY seat_invites_insert_own ON public.seat_invites
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS seat_invites_update_own ON public.seat_invites;
CREATE POLICY seat_invites_update_own ON public.seat_invites
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS seat_invites_service_all ON public.seat_invites;
CREATE POLICY seat_invites_service_all ON public.seat_invites
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- SEAT_CLAIMS Policies (DROP IF EXISTS to prevent conflicts)
DROP POLICY IF EXISTS seat_claims_select_own ON public.seat_claims;
CREATE POLICY seat_claims_select_own ON public.seat_claims
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS seat_claims_select_trainer ON public.seat_claims;
CREATE POLICY seat_claims_select_trainer ON public.seat_claims
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = seat_claims.order_id
      AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS seat_claims_service_all ON public.seat_claims;
CREATE POLICY seat_claims_service_all ON public.seat_claims
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================================
-- HELPER VIEW: Order seat usage summary
-- =====================================================================
CREATE OR REPLACE VIEW public.v_order_seat_usage AS
SELECT 
  o.id as order_id,
  o.user_id as trainer_id,
  o.course_id,
  o.seats as total_seats,
  COALESCE(COUNT(sc.id), 0)::INTEGER as claimed,
  (o.seats - COALESCE(COUNT(sc.id), 0))::INTEGER as remaining
FROM public.orders o
LEFT JOIN public.seat_claims sc ON sc.order_id = o.id
GROUP BY o.id, o.user_id, o.course_id, o.seats;

COMMENT ON VIEW public.v_order_seat_usage IS 'Provides seat usage summary per order for trainer dashboard';

-- Grant access to view
GRANT SELECT ON public.v_order_seat_usage TO authenticated, service_role;

-- =====================================================================
-- COMMENTS (Documentation)
-- =====================================================================
COMMENT ON TABLE public.seat_invites IS 'Trainer invitations to learners for claiming training seats from multi-seat purchases';
COMMENT ON TABLE public.seat_claims IS 'Tracks which users have claimed seats from multi-seat training orders';

COMMENT ON COLUMN public.seat_invites.status IS 'pending: created but not sent | sent: email sent | claimed: user enrolled | failed: email failed | expired: past expiry';
COMMENT ON COLUMN public.seat_invites.invite_token IS 'Secure random token generated when email is sent, used in claim URL';
COMMENT ON COLUMN public.seat_invites.expires_at IS 'Invitation expiration date, typically 14 days from sent_at';
COMMENT ON COLUMN public.seat_invites.note IS 'Optional message from trainer to learner (e.g., "Warehouse team batch 1")';

