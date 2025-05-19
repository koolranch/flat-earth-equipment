-- Update the price update trigger to sync both price fields
CREATE OR REPLACE FUNCTION handle_price_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the display price to match price_cents
  NEW.price = NEW.price_cents::DECIMAL / 100;
  
  -- Only proceed with Stripe sync if price_cents has changed
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS sync_price_to_stripe ON parts;
CREATE TRIGGER sync_price_to_stripe
  BEFORE UPDATE OF price_cents ON parts
  FOR EACH ROW
  EXECUTE FUNCTION handle_price_update(); 