-- Add Stripe linkage columns to parts_catalog so charger PDPs can offer
-- direct checkout. Additive only: no existing columns, data, or policies
-- are modified. Rows without a stripe_price_id keep quote-only behavior.
ALTER TABLE parts_catalog
  ADD COLUMN IF NOT EXISTS stripe_product_id text,
  ADD COLUMN IF NOT EXISTS stripe_price_id text;

COMMENT ON COLUMN parts_catalog.stripe_product_id IS 'Stripe Product ID for direct checkout (created by scripts/create-charger-stripe-prices.ts)';
COMMENT ON COLUMN parts_catalog.stripe_price_id IS 'Stripe Price ID for direct checkout; null = quote-only';
