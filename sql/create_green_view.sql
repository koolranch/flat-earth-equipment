-- Create GREEN-only view for clean selector queries
CREATE OR REPLACE VIEW public.green_chargers AS
SELECT id, slug, name, voltage, amperage, phase,
       price, price_cents, image_url, sku, description, brand, quick_ship,
       stripe_price_id
FROM public.parts
WHERE category_slug = 'battery-chargers'
  AND (slug ILIKE 'green%' OR name ILIKE '%green%');

-- Verify the view works
SELECT COUNT(*) as green_charger_count FROM public.green_chargers;
