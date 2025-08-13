-- Add structured charger specification columns to public.parts
-- These columns are nullable and safe for non-charger products

-- 1) Add nullable spec columns (safe for non-chargers)
ALTER TABLE public.parts
  ADD COLUMN IF NOT EXISTS voltage INTEGER NULL,
  ADD COLUMN IF NOT EXISTS amperage INTEGER NULL,
  ADD COLUMN IF NOT EXISTS phase TEXT NULL CHECK (phase IN ('1P','3P') OR phase IS NULL);

-- 2) Add helpful indexes for selector queries
CREATE INDEX IF NOT EXISTS idx_parts_voltage ON public.parts(voltage);
CREATE INDEX IF NOT EXISTS idx_parts_amperage ON public.parts(amperage);
CREATE INDEX IF NOT EXISTS idx_parts_phase ON public.parts(phase);

-- 3) Composite index for common charger filtering patterns
CREATE INDEX IF NOT EXISTS idx_parts_charger_specs ON public.parts(category_slug, voltage, amperage, phase) 
WHERE category_slug = 'battery-chargers';

-- Verify the migration
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'parts' 
  AND column_name IN ('voltage', 'amperage', 'phase')
ORDER BY column_name;
