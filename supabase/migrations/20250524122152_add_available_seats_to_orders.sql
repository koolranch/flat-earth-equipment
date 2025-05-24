-- Add available_seats column to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS available_seats INTEGER DEFAULT 0;

-- Update existing multi-seat orders to have available_seats = seats
UPDATE public.orders
SET available_seats = seats
WHERE seats > 1 AND available_seats = 0; 