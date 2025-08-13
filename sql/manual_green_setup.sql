-- MANUAL SETUP FOR GREEN DATA QUALITY SYSTEM
-- Copy and paste this into Supabase SQL Editor if migration doesn't work

-- 1) Ensure structured columns exist (safe if already created)
ALTER TABLE public.parts
  ADD COLUMN IF NOT EXISTS voltage INTEGER NULL,
  ADD COLUMN IF NOT EXISTS amperage INTEGER NULL,
  ADD COLUMN IF NOT EXISTS phase TEXT NULL CHECK (phase IN ('1P','3P') OR phase IS NULL);

-- 2) Create helpful partial indexes (GREEN subset) for selector speed
CREATE INDEX IF NOT EXISTS idx_parts_green_vap ON public.parts (voltage, amperage, phase)
  WHERE slug ILIKE 'green%';

CREATE INDEX IF NOT EXISTS idx_parts_green_category ON public.parts (category_slug, slug)
  WHERE (slug ILIKE 'green%' OR name ILIKE '%green%');

-- 3) Create trigger to enforce GREEN data quality (others remain NULL-allowed)
CREATE OR REPLACE FUNCTION public.enforce_green_specs()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- Only enforce rules for GREEN products
  IF (NEW.slug ILIKE 'green%' OR NEW.name ILIKE '%green%') THEN
    -- Require voltage and amperage for GREEN chargers
    IF NEW.category_slug = 'battery-chargers' AND (NEW.voltage IS NULL OR NEW.amperage IS NULL) THEN
      RAISE EXCEPTION 'GREEN chargers must have voltage and amperage (slug: %, name: %)', NEW.slug, NEW.name;
    END IF;
    
    -- Phase rule by family pattern (only for chargers)
    IF NEW.category_slug = 'battery-chargers' THEN
      IF NEW.slug ~* 'green(2|4)' AND NEW.phase IS DISTINCT FROM '1P' THEN
        RAISE EXCEPTION 'GREEN2/4 chargers must be 1P (slug: %)', NEW.slug;
      END IF;
      IF NEW.slug ~* 'green(6|8|x)' AND NEW.phase IS DISTINCT FROM '3P' THEN
        RAISE EXCEPTION 'GREEN6/8/X chargers must be 3P (slug: %)', NEW.slug;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;$$;

-- Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS trg_enforce_green_specs ON public.parts;
CREATE TRIGGER trg_enforce_green_specs
  BEFORE INSERT OR UPDATE ON public.parts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_green_specs();

-- 4) Create GREEN-only view for clean selector queries
CREATE OR REPLACE VIEW public.green_chargers AS
SELECT 
  id, 
  slug, 
  name, 
  voltage, 
  amperage, 
  phase,
  price, 
  price_cents, 
  image_url, 
  sku, 
  description, 
  brand, 
  stripe_price_id,
  category_slug,
  -- Add computed fields for enhanced querying
  CASE 
    WHEN voltage IS NOT NULL AND amperage IS NOT NULL AND phase IS NOT NULL 
    THEN true 
    ELSE false 
  END as specs_complete
FROM public.parts
WHERE category_slug = 'battery-chargers'
  AND (slug ILIKE 'green%' OR name ILIKE '%green%')
  AND voltage IS NOT NULL 
  AND amperage IS NOT NULL;

-- 5) Grant appropriate permissions
GRANT SELECT ON public.green_chargers TO anon, authenticated;

-- 6) Add comments for documentation
COMMENT ON VIEW public.green_chargers IS 'GREEN Series battery chargers with guaranteed structured specs (voltage, amperage, phase)';

-- 7) Helper function to validate GREEN data before bulk operations
CREATE OR REPLACE FUNCTION public.validate_green_charger_specs()
RETURNS TABLE (
  id uuid,
  slug text,
  name text,
  missing_fields text[]
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.slug,
    p.name,
    ARRAY_REMOVE(ARRAY[
      CASE WHEN p.voltage IS NULL THEN 'voltage' END,
      CASE WHEN p.amperage IS NULL THEN 'amperage' END,
      CASE WHEN p.phase IS NULL THEN 'phase' END
    ], NULL) as missing_fields
  FROM public.parts p
  WHERE p.category_slug = 'battery-chargers'
    AND (p.slug ILIKE 'green%' OR p.name ILIKE '%green%')
    AND (p.voltage IS NULL OR p.amperage IS NULL OR p.phase IS NULL);
END;$$;

-- VERIFICATION QUERIES
-- Run these after the above to verify everything is working:

-- Check if view was created successfully
SELECT COUNT(*) as green_charger_count FROM public.green_chargers;

-- Check for any GREEN chargers missing specs
SELECT * FROM public.validate_green_charger_specs();

-- Test the trigger (this should work)
-- UPDATE public.parts SET voltage = 48 WHERE slug LIKE 'green%' LIMIT 1;

-- Test the trigger constraint (this should fail if you have incomplete GREEN data)
-- UPDATE public.parts SET voltage = NULL WHERE slug LIKE 'green%' LIMIT 1;
