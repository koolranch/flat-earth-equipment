-- Brand Hub Upgrade SQL Schema
-- Creates new tables for unified brand pages (serial + fault codes + parts leads)
-- Non-destructive: Does not modify existing serial lookup tables

-- Brands master table for brand hub metadata
CREATE TABLE IF NOT EXISTS public.brands (
  id bigserial PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  logo_url text,
  description text,
  equipment_types text[], -- e.g., ['forklifts', 'aerial', 'construction']
  has_serial_lookup boolean DEFAULT false,
  has_fault_codes boolean DEFAULT false,
  website_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fault codes database for search functionality
CREATE TABLE IF NOT EXISTS public.fault_codes (
  id bigserial PRIMARY KEY,
  brand_slug text NOT NULL REFERENCES brands(slug) ON DELETE CASCADE,
  equipment_type text, -- forklift, aerial, etc.
  model_pattern text, -- regex or ILIKE pattern for models
  code text NOT NULL,
  description text NOT NULL,
  category text, -- hydraulic, electrical, engine, etc.
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  solution text,
  manual_reference text,
  source_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Parts lead generation tracking
CREATE TABLE IF NOT EXISTS public.parts_leads (
  id bigserial PRIMARY KEY,
  brand_slug text NOT NULL,
  equipment_type text,
  model text,
  serial_number text,
  part_description text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  company_name text,
  notes text,
  urgency text CHECK (urgency IN ('low', 'medium', 'high', 'emergency')),
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'converted', 'closed')),
  submitted_at timestamptz DEFAULT now(),
  follow_up_at timestamptz,
  user_agent text,
  ip_address inet,
  utm_source text,
  utm_medium text,
  utm_campaign text
);

-- Brand page analytics
CREATE TABLE IF NOT EXISTS public.brand_page_views (
  id bigserial PRIMARY KEY,
  brand_slug text NOT NULL,
  tab_name text, -- 'serial', 'fault-codes', 'parts'
  session_id text,
  user_agent text,
  ip_address inet,
  referrer text,
  viewed_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fault_codes_brand_slug ON fault_codes(brand_slug);
CREATE INDEX IF NOT EXISTS idx_fault_codes_code ON fault_codes(code);
CREATE INDEX IF NOT EXISTS idx_fault_codes_brand_code ON fault_codes(brand_slug, code);
CREATE INDEX IF NOT EXISTS idx_fault_codes_equipment_type ON fault_codes(equipment_type);
CREATE INDEX IF NOT EXISTS idx_fault_codes_category ON fault_codes(category);

CREATE INDEX IF NOT EXISTS idx_parts_leads_brand_slug ON parts_leads(brand_slug);
CREATE INDEX IF NOT EXISTS idx_parts_leads_status ON parts_leads(status);
CREATE INDEX IF NOT EXISTS idx_parts_leads_submitted_at ON parts_leads(submitted_at);

CREATE INDEX IF NOT EXISTS idx_brand_page_views_brand_slug ON brand_page_views(brand_slug);
CREATE INDEX IF NOT EXISTS idx_brand_page_views_tab_name ON brand_page_views(tab_name);
CREATE INDEX IF NOT EXISTS idx_brand_page_views_viewed_at ON brand_page_views(viewed_at);

-- Row Level Security (RLS) policies
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fault_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_page_views ENABLE ROW LEVEL SECURITY;

-- Read-only access for brands and fault codes (public data)
DROP POLICY IF EXISTS "brands_read_only" ON public.brands;
CREATE POLICY "brands_read_only" ON public.brands FOR SELECT USING (true);

DROP POLICY IF EXISTS "fault_codes_read_only" ON public.fault_codes;
CREATE POLICY "fault_codes_read_only" ON public.fault_codes FOR SELECT USING (true);

-- Parts leads: service role can manage all, users can only insert
DROP POLICY IF EXISTS "parts_leads_service_role" ON public.parts_leads;
CREATE POLICY "parts_leads_service_role" ON public.parts_leads 
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "parts_leads_insert_public" ON public.parts_leads;
CREATE POLICY "parts_leads_insert_public" ON public.parts_leads 
  FOR INSERT WITH CHECK (true);

-- Brand page views: service role only for analytics
DROP POLICY IF EXISTS "brand_page_views_service_role" ON public.brand_page_views;
CREATE POLICY "brand_page_views_service_role" ON public.brand_page_views 
  USING (auth.role() = 'service_role');

-- Seed initial brand data based on existing serial lookup tools
INSERT INTO public.brands (slug, name, equipment_types, has_serial_lookup, has_fault_codes) VALUES
  ('toyota', 'Toyota', ARRAY['forklifts'], true, true),
  ('hyster', 'Hyster', ARRAY['forklifts'], true, true),
  ('bobcat', 'Bobcat', ARRAY['construction', 'forklifts'], true, false),
  ('crown', 'Crown', ARRAY['forklifts'], true, false),
  ('clark', 'Clark', ARRAY['forklifts'], true, false),
  ('cat', 'CAT', ARRAY['forklifts', 'construction'], true, true),
  ('doosan', 'Doosan', ARRAY['forklifts'], true, false),
  ('jlg', 'JLG', ARRAY['aerial'], true, false),
  ('karcher', 'Kärcher', ARRAY['cleaning'], true, false),
  ('factory-cat', 'Factory Cat', ARRAY['cleaning'], true, false),
  ('tennant', 'Tennant', ARRAY['cleaning'], true, false),
  ('haulotte', 'Haulotte', ARRAY['aerial'], true, false),
  ('yale', 'Yale', ARRAY['forklifts'], true, false),
  ('raymond', 'Raymond', ARRAY['forklifts'], true, false),
  ('ep', 'EP', ARRAY['forklifts'], true, false),
  ('linde', 'Linde', ARRAY['forklifts'], true, false),
  ('mitsubishi', 'Mitsubishi', ARRAY['forklifts'], true, false),
  ('komatsu', 'Komatsu', ARRAY['forklifts', 'construction'], true, false),
  ('case', 'Case', ARRAY['construction'], true, false),
  ('new-holland', 'New Holland', ARRAY['construction'], true, false),
  ('takeuchi', 'Takeuchi', ARRAY['construction'], true, false),
  ('kubota', 'Kubota', ARRAY['construction'], true, false),
  ('toro', 'Toro', ARRAY['grounds'], true, false),
  ('xcmg', 'XCMG', ARRAY['construction'], true, false),
  ('sinoboom', 'Sinoboom', ARRAY['aerial'], true, false),
  ('skyjack', 'Skyjack', ARRAY['aerial'], true, false),
  ('jungheinrich', 'Jungheinrich', ARRAY['forklifts'], true, false),
  ('gehl', 'Gehl', ARRAY['construction'], true, false),
  ('hangcha', 'Hangcha', ARRAY['forklifts'], true, false),
  ('lull', 'Lull', ARRAY['construction'], true, false),
  ('manitou', 'Manitou', ARRAY['construction'], true, false),
  ('unicarriers', 'UniCarriers', ARRAY['forklifts'], true, false),
  ('jcb', 'JCB', ARRAY['construction'], true, true)
ON CONFLICT (slug) DO UPDATE SET
  equipment_types = EXCLUDED.equipment_types,
  has_serial_lookup = EXCLUDED.has_serial_lookup,
  has_fault_codes = EXCLUDED.has_fault_codes,
  updated_at = now();

-- Sample fault codes data for brands with existing fault code pages
INSERT INTO public.fault_codes (brand_slug, equipment_type, code, description, category, severity, solution) VALUES
  ('cat', 'forklift', 'E1001', 'Engine coolant temperature high', 'engine', 'high', 'Check coolant level, radiator, and water pump'),
  ('cat', 'forklift', 'E1002', 'Engine oil pressure low', 'engine', 'critical', 'Stop operation immediately. Check oil level and engine oil pump'),
  ('cat', 'forklift', 'E2001', 'Hydraulic oil temperature high', 'hydraulic', 'medium', 'Check hydraulic oil level and cooling system'),
  ('cat', 'forklift', 'E3001', 'Battery voltage low', 'electrical', 'medium', 'Check battery connections and charging system'),
  ('toyota', 'forklift', 'E A5-1', 'Communication error between display and controller', 'electrical', 'medium', 'Check wiring harness connections between display unit and main controller'),
  ('toyota', 'forklift', 'E A2-1', 'Accelerator pedal sensor fault', 'electrical', 'high', 'Inspect accelerator pedal wiring and replace sensor if necessary'),
  ('toyota', 'forklift', 'E B1-1', 'Brake pedal sensor fault', 'electrical', 'critical', 'Check brake pedal sensor and wiring. Do not operate until resolved'),
  ('hyster', 'forklift', 'F001', 'Engine overheat protection', 'engine', 'high', 'Allow engine to cool, check coolant level and radiator'),
  ('hyster', 'forklift', 'F002', 'Hydraulic overload protection', 'hydraulic', 'medium', 'Reduce load and check hydraulic system pressure'),
  ('jcb', 'telehandler', 'E0001', 'Engine fault - immediate stop required', 'engine', 'critical', 'Stop operation and contact service technician'),
  ('jcb', 'telehandler', 'E0102', 'Hydraulic system pressure fault', 'hydraulic', 'high', 'Check hydraulic fluid level and system pressure')
ON CONFLICT DO NOTHING;

-- Create updated_at trigger for brands table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_brands_updated_at ON public.brands;
CREATE TRIGGER update_brands_updated_at 
  BEFORE UPDATE ON public.brands 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fault_codes_updated_at ON public.fault_codes;
CREATE TRIGGER update_fault_codes_updated_at 
  BEFORE UPDATE ON public.fault_codes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
