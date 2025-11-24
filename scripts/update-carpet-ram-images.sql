-- Update all Rug / Carpet Rams products with new image URL
UPDATE parts
SET image_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products/carpetpole.jpeg',
    updated_at = NOW()
WHERE category = 'Rug / Carpet Rams';

-- Verify the update
SELECT sku, name, image_url 
FROM parts 
WHERE category = 'Rug / Carpet Rams'
LIMIT 5;
