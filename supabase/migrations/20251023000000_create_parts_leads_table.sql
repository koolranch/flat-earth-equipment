-- Create parts_leads table for parts request form submissions
CREATE TABLE IF NOT EXISTS public.parts_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Brand and equipment details
  brand_slug TEXT NOT NULL,
  equipment_type TEXT,
  model TEXT,
  serial_number TEXT,
  
  -- Parts description
  part_description TEXT NOT NULL,
  
  -- Contact information
  contact_name TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  company_name TEXT,
  
  -- Additional details
  notes TEXT,
  urgency TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'new',
  
  -- Tracking
  user_agent TEXT,
  ip_address TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Constraints
  CONSTRAINT parts_leads_email_check CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT parts_leads_status_check CHECK (status IN ('new', 'contacted', 'quoted', 'closed', 'lost'))
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_parts_leads_brand_slug ON public.parts_leads(brand_slug);
CREATE INDEX IF NOT EXISTS idx_parts_leads_status ON public.parts_leads(status);
CREATE INDEX IF NOT EXISTS idx_parts_leads_created_at ON public.parts_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parts_leads_email ON public.parts_leads(contact_email);

-- Enable Row Level Security
ALTER TABLE public.parts_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to do anything
CREATE POLICY "Service role has full access to parts_leads"
  ON public.parts_leads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Allow inserts from authenticated or anonymous users (public form)
CREATE POLICY "Allow public to insert parts leads"
  ON public.parts_leads
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Comment on table
COMMENT ON TABLE public.parts_leads IS 'Stores parts request submissions from brand serial lookup pages';

