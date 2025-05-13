-- Add price_cents column to rental_equipment table
ALTER TABLE rental_equipment
ADD COLUMN price_cents INTEGER;

-- Add stripe_price_id column to rental_equipment table
ALTER TABLE rental_equipment
ADD COLUMN stripe_price_id TEXT; 