-- Add Stripe integration fields to parts table
-- Date: 2025-09-25
-- Purpose: Add stripe_price_id and price_cents fields to enable Stripe checkout integration

ALTER TABLE parts
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
  ADD COLUMN IF NOT EXISTS price_cents INTEGER;

-- Create index for stripe_price_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_parts_stripe_price_id ON parts(stripe_price_id);

-- Update existing records to populate price_cents from price
UPDATE parts 
SET price_cents = ROUND(price * 100)::INTEGER 
WHERE price_cents IS NULL AND price IS NOT NULL;

-- Create trigger to keep price and price_cents in sync
CREATE OR REPLACE FUNCTION sync_parts_price_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If price_cents is updated, sync price
  IF NEW.price_cents IS DISTINCT FROM OLD.price_cents THEN
    NEW.price = NEW.price_cents::DECIMAL / 100;
  END IF;
  
  -- If price is updated, sync price_cents
  IF NEW.price IS DISTINCT FROM OLD.price THEN
    NEW.price_cents = ROUND(NEW.price * 100)::INTEGER;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS sync_parts_price_fields_trigger ON parts;
CREATE TRIGGER sync_parts_price_fields_trigger
  BEFORE UPDATE ON parts
  FOR EACH ROW
  EXECUTE FUNCTION sync_parts_price_fields();

-- Update RLS policies to include new columns
ALTER POLICY "allow_anon_select_parts" ON parts
    USING (true);

-- Comment the new columns for documentation
COMMENT ON COLUMN parts.stripe_price_id IS 'Stripe Price ID for checkout integration';
COMMENT ON COLUMN parts.price_cents IS 'Price in cents for Stripe integration (synced with price field)';
