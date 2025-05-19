-- Add skid steer rentals
INSERT INTO rental_equipment (
  name,
  slug,
  brand,
  category,
  description,
  image_url,
  weight_capacity_lbs,
  lift_height_ft,
  power_source,
  price_cents
) VALUES
(
  'John Deere 320 Skid Steer',
  'john-deere-320-skid-steer',
  'John Deere',
  'skid-steer',
  'Versatile skid steer with 62 hp engine, 1,450 lb rated operating capacity, and excellent maneuverability. Perfect for construction, landscaping, and agricultural tasks.',
  'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/rental-equipment/john-deere-320-skid-steer.jpg',
  1450,
  8,
  'Diesel',
  74900
),
(
  'Bobcat S650 Skid Steer',
  'bobcat-s650-skid-steer',
  'Bobcat',
  'skid-steer',
  'High-performance skid steer with 74 hp engine, 2,200 lb rated operating capacity, and advanced control system. Ideal for heavy-duty construction and material handling.',
  'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/rental-equipment/bobcat-s650-skid-steer.jpg',
  2200,
  10,
  'Diesel',
  89900
),
(
  'Kubota SVL75-2 Track Loader',
  'kubota-svl75-2-track-loader',
  'Kubota',
  'skid-steer',
  'Track-mounted skid steer with 74 hp engine, 2,200 lb rated operating capacity, and excellent traction. Perfect for soft ground conditions and heavy lifting.',
  'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/rental-equipment/kubota-svl75-2-track-loader.jpg',
  2200,
  9,
  'Diesel',
  99900
); 