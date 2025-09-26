-- Fix Hawker 6LA20671 Repair and Return product to remove core charge
-- Repair and Return services should not have core charges since customer sends their own unit

-- First, let's see what we're working with
SELECT 
  id, 
  name, 
  sku, 
  price, 
  has_core_charge, 
  core_charge,
  category,
  brand
FROM parts 
WHERE (
  name ILIKE '%6LA20671%' 
  OR sku ILIKE '%6LA20671%' 
  OR name ILIKE '%Hawker%Repair%Return%'
  OR name ILIKE '%Hawker%Repair & Return%'
)
ORDER BY name;

-- Update the specific Repair and Return product to remove core charges
UPDATE parts 
SET 
  has_core_charge = FALSE,
  core_charge = 0.00
WHERE (
  name ILIKE '%Hawker%' 
  AND name ILIKE '%6LA20671%' 
  AND (
    name ILIKE '%Repair and Return%' 
    OR name ILIKE '%Repair & Return%'
  )
);

-- Verify the fix
SELECT 
  id, 
  name, 
  sku, 
  price, 
  has_core_charge, 
  core_charge,
  category,
  brand
FROM parts 
WHERE (
  name ILIKE '%6LA20671%' 
  OR sku ILIKE '%6LA20671%' 
  OR name ILIKE '%Hawker%Repair%Return%'
  OR name ILIKE '%Hawker%Repair & Return%'
)
ORDER BY name;
