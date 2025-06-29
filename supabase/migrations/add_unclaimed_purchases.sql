-- Migration: Add unclaimed_purchases table for regular training customers
-- This allows customers to claim their training access after purchase

CREATE TABLE IF NOT EXISTS public.unclaimed_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id) NOT NULL,
  quantity INTEGER DEFAULT 1,
  amount_cents INTEGER NOT NULL,
  purchase_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending_claim' CHECK (status IN ('pending_claim', 'claimed', 'expired')),
  claimed_by_user_id UUID REFERENCES auth.users(id),
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.unclaimed_purchases ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view unclaimed purchases for their email
CREATE POLICY "unclaimed_purchases_view_own_email" ON public.unclaimed_purchases
  FOR SELECT USING (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Policy: Users can update (claim) purchases for their email
CREATE POLICY "unclaimed_purchases_claim_own_email" ON public.unclaimed_purchases
  FOR UPDATE USING (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'pending_claim'
  );

-- Policy: Service role can insert/manage all
CREATE POLICY "unclaimed_purchases_service_role" ON public.unclaimed_purchases
  FOR ALL USING (auth.role() = 'service_role');

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_unclaimed_purchases_email ON public.unclaimed_purchases(customer_email);
CREATE INDEX IF NOT EXISTS idx_unclaimed_purchases_status ON public.unclaimed_purchases(status);
CREATE INDEX IF NOT EXISTS idx_unclaimed_purchases_stripe_session ON public.unclaimed_purchases(stripe_session_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_unclaimed_purchases_updated_at 
  BEFORE UPDATE ON public.unclaimed_purchases 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 