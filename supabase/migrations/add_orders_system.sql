-- Migration: Add comprehensive orders system
-- This creates proper order tracking for all purchases (parts, training, repairs)

-- Create orders table for all purchase types
CREATE TABLE IF NOT EXISTS public.customer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  order_number TEXT UNIQUE NOT NULL, -- Human-readable order number
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  
  -- Order totals
  subtotal_cents INTEGER NOT NULL,
  shipping_cents INTEGER DEFAULT 0,
  tax_cents INTEGER DEFAULT 0,
  total_cents INTEGER NOT NULL,
  
  -- Order status and tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  order_type TEXT NOT NULL CHECK (order_type IN ('parts', 'training', 'repair')),
  
  -- Shipping information
  shipping_name TEXT,
  shipping_street1 TEXT,
  shipping_street2 TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  shipping_country TEXT DEFAULT 'US',
  
  -- Fulfillment tracking
  tracking_number TEXT,
  tracking_url TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order line items for detailed purchase tracking
CREATE TABLE IF NOT EXISTS public.order_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.customer_orders(id) ON DELETE CASCADE,
  
  -- Product information
  product_type TEXT NOT NULL CHECK (product_type IN ('part', 'training_course', 'repair_service')),
  product_id UUID, -- References parts.id, courses.id, etc.
  product_name TEXT NOT NULL,
  product_sku TEXT,
  
  -- Pricing
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL,
  total_price_cents INTEGER NOT NULL,
  
  -- Additional charges
  core_charge_cents INTEGER DEFAULT 0,
  
  -- Product metadata
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_orders_email ON public.customer_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_customer_orders_status ON public.customer_orders(status);
CREATE INDEX IF NOT EXISTS idx_customer_orders_created ON public.customer_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_line_items_order_id ON public.order_line_items(order_id);

-- Create sequence for human-readable order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'FEE-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating timestamps
CREATE TRIGGER update_customer_orders_updated_at
  BEFORE UPDATE ON public.customer_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_line_items ENABLE ROW LEVEL SECURITY;

-- Add RLS policies (admin can see all, customers can see their own)
CREATE POLICY "Admin can view all orders" ON public.customer_orders
  FOR ALL TO service_role
  USING (true);

CREATE POLICY "Customers can view their own orders" ON public.customer_orders
  FOR SELECT TO authenticated
  USING (customer_email = auth.jwt()->>'email');

CREATE POLICY "Admin can view all order items" ON public.order_line_items
  FOR ALL TO service_role
  USING (true);

CREATE POLICY "Customers can view their own order items" ON public.order_line_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customer_orders 
      WHERE customer_orders.id = order_line_items.order_id 
      AND customer_orders.customer_email = auth.jwt()->>'email'
    )
  ); 