-- Create repair_orders table to track charger module repair orders and shipping labels
CREATE TABLE repair_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_session_id TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  module_type TEXT NOT NULL,
  firmware_version TEXT,
  label_url TEXT NOT NULL,
  tracking_number TEXT NOT NULL,
  tracking_url TEXT,
  carrier TEXT NOT NULL,
  service_name TEXT,
  shipping_cost DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'label_generated',
  repair_notes TEXT,
  inbound_tracking_status TEXT,
  outbound_tracking_number TEXT,
  outbound_label_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies
ALTER TABLE repair_orders ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view their own orders
CREATE POLICY "Users can view their own repair orders" ON repair_orders
  FOR SELECT USING (auth.jwt() ->> 'email' = customer_email);

-- Policy for service role to manage all orders  
CREATE POLICY "Service role can manage all repair orders" ON repair_orders
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Add indexes for performance
CREATE INDEX idx_repair_orders_stripe_session ON repair_orders(stripe_session_id);
CREATE INDEX idx_repair_orders_customer_email ON repair_orders(customer_email);
CREATE INDEX idx_repair_orders_tracking ON repair_orders(tracking_number);
CREATE INDEX idx_repair_orders_status ON repair_orders(status); 