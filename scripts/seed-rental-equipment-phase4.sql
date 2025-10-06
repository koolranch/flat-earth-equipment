-- Phase 4: Safe additive seeding of rental equipment
-- This script only INSERTs new equipment, never UPDATEs or DELETEs
-- Run this manually in Supabase SQL editor or via psql

-- Additional Boom Lifts (popular models)
INSERT INTO public.rental_equipment (id, category, brand, model, lift_height_ft, weight_capacity_lbs, power_source, seo_slug, created_at)
VALUES 
  (gen_random_uuid(), 'Boom Lift', 'Genie', 'S-45', 45, 500, 'diesel', 'genie-s-45', now()),
  (gen_random_uuid(), 'Boom Lift', 'Genie', 'S-85', 85, 500, 'diesel', 'genie-s-85', now()),
  (gen_random_uuid(), 'Boom Lift', 'JLG', '600S', 60, 500, 'diesel', 'jlg-600s', now()),
  (gen_random_uuid(), 'Boom Lift', 'JLG', '800S', 80, 500, 'diesel', 'jlg-800s', now())
ON CONFLICT (seo_slug) DO NOTHING; -- Safe: skip if already exists

-- Additional Scissor Lifts (popular models)
INSERT INTO public.rental_equipment (id, category, brand, model, lift_height_ft, weight_capacity_lbs, power_source, seo_slug, created_at)
VALUES 
  (gen_random_uuid(), 'Scissor Lift', 'Genie', 'GS-1932', 19, 500, 'electric', 'genie-gs-1932', now()),
  (gen_random_uuid(), 'Scissor Lift', 'Genie', 'GS-3246', 32, 500, 'electric', 'genie-gs-3246', now()),
  (gen_random_uuid(), 'Scissor Lift', 'JLG', '2646ES', 26, 500, 'electric', 'jlg-2646es', now()),
  (gen_random_uuid(), 'Scissor Lift', 'Skyjack', 'SJ3219', 19, 500, 'electric', 'skyjack-sj3219', now())
ON CONFLICT (seo_slug) DO NOTHING;

-- Additional Forklifts (popular models from your lookup data)
INSERT INTO public.rental_equipment (id, category, brand, model, lift_height_ft, weight_capacity_lbs, power_source, seo_slug, created_at)
VALUES 
  (gen_random_uuid(), 'Forklift', 'Toyota', '8FGCU25', NULL, 5000, 'LPG', 'toyota-8fgcu25', now()),
  (gen_random_uuid(), 'Forklift', 'Toyota', '8FGU30', NULL, 6000, 'LPG', 'toyota-8fgu30', now()),
  (gen_random_uuid(), 'Forklift', 'Hyster', 'H50FT', NULL, 5000, 'LPG', 'hyster-h50ft', now()),
  (gen_random_uuid(), 'Forklift', 'Yale', 'GLC050', NULL, 5000, 'LPG', 'yale-glc050', now()),
  (gen_random_uuid(), 'Forklift', 'Crown', 'RC5500', NULL, 3000, 'electric', 'crown-rc5500', now())
ON CONFLICT (seo_slug) DO NOTHING;

-- Additional Telehandlers (popular models)
INSERT INTO public.rental_equipment (id, category, brand, model, lift_height_ft, weight_capacity_lbs, power_source, seo_slug, created_at)
VALUES 
  (gen_random_uuid(), 'Telehandler', 'JLG', 'G12-55A', 55, 12000, 'diesel', 'jlg-g12-55a', now()),
  (gen_random_uuid(), 'Telehandler', 'Genie', 'GTH-844', 44, 8000, 'diesel', 'genie-gth-844', now()),
  (gen_random_uuid(), 'Telehandler', 'JCB', '540-170', 70, 8800, 'diesel', 'jcb-540-170', now())
ON CONFLICT (seo_slug) DO NOTHING;

-- Additional Skid Steers (popular models)
INSERT INTO public.rental_equipment (id, category, brand, model, lift_height_ft, weight_capacity_lbs, power_source, seo_slug, created_at)
VALUES 
  (gen_random_uuid(), 'Skid Steer', 'Bobcat', 'S570', NULL, 1750, 'diesel', 'bobcat-s570', now()),
  (gen_random_uuid(), 'Skid Steer', 'Bobcat', 'S650', NULL, 2200, 'diesel', 'bobcat-s650', now()),
  (gen_random_uuid(), 'Skid Steer', 'Caterpillar', '262D', NULL, 2200, 'diesel', 'caterpillar-262d', now()),
  (gen_random_uuid(), 'Skid Steer', 'Case', 'SR210', NULL, 2100, 'diesel', 'case-sr210', now())
ON CONFLICT (seo_slug) DO NOTHING;

-- Verify the additions
SELECT 
  category,
  COUNT(*) as count
FROM public.rental_equipment
GROUP BY category
ORDER BY category;

-- Show newly added equipment
SELECT 
  category,
  brand,
  model,
  lift_height_ft,
  weight_capacity_lbs,
  power_source
FROM public.rental_equipment
WHERE created_at > (now() - interval '1 minute')
ORDER BY category, brand, model;
