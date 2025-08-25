-- Kärcher Serial Number Lookup Tables
-- Non-destructive schema creation with IF NOT EXISTS

CREATE TABLE IF NOT EXISTS public.karcher_models (
  id bigserial PRIMARY KEY,
  family text NOT NULL,
  model_code text NOT NULL,
  common_names text,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.karcher_plate_locations (
  id bigserial PRIMARY KEY,
  model_pattern text NOT NULL,
  location_text text NOT NULL,
  confidence text CHECK (confidence IN ('high','medium','verify')),
  source_url text,
  source_quote text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.karcher_serial_patterns (
  id bigserial PRIMARY KEY,
  pattern_label text NOT NULL,
  example_sn text,
  interpretation_note text,
  source_url text,
  source_quote text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.karcher_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karcher_plate_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karcher_serial_patterns ENABLE ROW LEVEL SECURITY;

-- Create read-only policies (with IF NOT EXISTS check)
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'karcher_models' AND policyname = 'karcher_models_read'
  ) THEN 
    CREATE POLICY karcher_models_read ON public.karcher_models FOR SELECT USING (true); 
  END IF; 
END $$;

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'karcher_plate_locations' AND policyname = 'karcher_plate_locations_read'
  ) THEN 
    CREATE POLICY karcher_plate_locations_read ON public.karcher_plate_locations FOR SELECT USING (true); 
  END IF; 
END $$;

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'karcher_serial_patterns' AND policyname = 'karcher_serial_patterns_read'
  ) THEN 
    CREATE POLICY karcher_serial_patterns_read ON public.karcher_serial_patterns FOR SELECT USING (true); 
  END IF; 
END $$;
