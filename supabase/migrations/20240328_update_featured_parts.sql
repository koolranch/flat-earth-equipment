-- Update featured status for specific parts
UPDATE parts
SET featured = TRUE
WHERE slug IN ('enersys-6la20671', 'hawker-6la20671'); 