-- First create the price_update_queue table
CREATE TABLE IF NOT EXISTS public.price_update_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id UUID REFERENCES public.parts(id),
  old_price_cents INTEGER,
  new_price_cents INTEGER,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Then create the function to update prices
CREATE OR REPLACE FUNCTION fix_part_prices()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  WITH updates(sku, new_price, new_price_cents, new_core_flag, new_core_charge) AS (
    VALUES
      ('91A1431010',      898.00,   89800,  FALSE,   0.00),
      ('1600292',        2400.00, 240000,  TRUE,  800.00),
      ('7930220',         500.00,   50000, TRUE,  200.00),
      ('105739',          340.00,   34000, TRUE,  200.00),
      ('53720-U224171',   750.00,   75000, FALSE,   0.00),
      ('53730-U116271',   850.00,   85000, FALSE,   0.00),
      ('53730-U117071',   520.00,   52000, FALSE,   0.00),
      ('62-400-05',      1300.00, 130000, FALSE,   0.00),
      ('4092995',         550.00,   55000, TRUE,  200.00),
      ('7930220-TD',      350.00,   35000, TRUE,  200.00),
      ('148319-001',     1100.00, 110000, TRUE,  550.00),
      ('142517',          650.00,   65000, TRUE,  400.00),
      ('144583',          925.00,   92500, TRUE,  400.00)
  )
  UPDATE public.parts AS p
  SET
    price           = u.new_price,
    price_cents     = u.new_price_cents,
    has_core_charge = u.new_core_flag,
    core_charge     = u.new_core_charge
  FROM updates AS u
  WHERE p.sku = u.sku;
END;
$$; 