-- GREEN-only view with structured specs (no quick_ship column)
CREATE OR REPLACE VIEW public.green_chargers AS
SELECT
  id,
  slug,
  name,
  brand,
  description,
  image_url,
  sku,
  price,
  price_cents,
  stripe_price_id,
  voltage,
  amperage,
  phase
FROM public.parts
WHERE category_slug = 'battery-chargers'
  AND (slug ILIKE 'green%' OR name ILIKE 'green%')
  AND voltage IS NOT NULL
  AND amperage IS NOT NULL
  AND phase IS NOT NULL;

-- Helpful indexes (partial) for GREEN subset in base table
CREATE INDEX IF NOT EXISTS idx_parts_green_slug ON public.parts (slug) WHERE slug ILIKE 'green%';
CREATE INDEX IF NOT EXISTS idx_parts_green_vap  ON public.parts (voltage, amperage, phase) WHERE slug ILIKE 'green%';
