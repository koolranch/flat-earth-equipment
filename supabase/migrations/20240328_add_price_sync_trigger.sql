-- Create a function to handle price updates
CREATE OR REPLACE FUNCTION handle_price_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if price_cents has changed
  IF OLD.price_cents IS DISTINCT FROM NEW.price_cents THEN
    -- Insert into a queue table for processing
    INSERT INTO price_update_queue (
      part_id,
      old_price_cents,
      new_price_cents,
      stripe_price_id,
      created_at
    ) VALUES (
      NEW.id,
      OLD.price_cents,
      NEW.price_cents,
      NEW.stripe_price_id,
      CURRENT_TIMESTAMP
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a queue table for price updates
CREATE TABLE IF NOT EXISTS price_update_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID NOT NULL REFERENCES parts(id),
  old_price_cents INTEGER,
  new_price_cents INTEGER,
  stripe_price_id TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on processed_at for efficient querying
CREATE INDEX IF NOT EXISTS price_update_queue_processed_at_idx 
ON price_update_queue(processed_at);

-- Create the trigger
DROP TRIGGER IF EXISTS sync_price_to_stripe ON parts;
CREATE TRIGGER sync_price_to_stripe
  AFTER UPDATE OF price_cents ON parts
  FOR EACH ROW
  EXECUTE FUNCTION handle_price_update(); 