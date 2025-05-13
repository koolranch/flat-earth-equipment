-- Create rental_equipment table
CREATE TABLE IF NOT EXISTS rental_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  weight_capacity_lbs INTEGER,
  lift_height_ft INTEGER,
  power_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS rental_equipment_category_idx ON rental_equipment(category);
CREATE INDEX IF NOT EXISTS rental_equipment_brand_idx ON rental_equipment(brand);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_rental_equipment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_rental_equipment_updated_at
    BEFORE UPDATE ON rental_equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_rental_equipment_updated_at();

-- Enable Row Level Security
ALTER TABLE rental_equipment ENABLE ROW LEVEL SECURITY;

-- Allow anon role to SELECT
CREATE POLICY allow_anon_select_rental_equipment ON rental_equipment
  FOR SELECT USING (true); 