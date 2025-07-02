-- Create the customer_orders table that the webhook expects
CREATE TABLE IF NOT EXISTS public.customer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  
  -- Order totals  
  subtotal_cents INTEGER NOT NULL,
  shipping_cents INTEGER DEFAULT 0,
  tax_cents INTEGER DEFAULT 0,
  total_cents INTEGER NOT NULL,
  
  -- Order status and tracking
  status TEXT DEFAULT 'pending',
  order_type TEXT NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add basic indexes
CREATE INDEX IF NOT EXISTS idx_customer_orders_email ON public.customer_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_customer_orders_created ON public.customer_orders(created_at DESC);

-- Enable RLS
ALTER TABLE public.customer_orders ENABLE ROW LEVEL SECURITY;

-- Simple RLS policy for service role
CREATE POLICY "service_role_full_access_customer_orders" ON public.customer_orders
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.customer_orders TO service_role;
