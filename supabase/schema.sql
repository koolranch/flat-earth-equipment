-- Create parts table
CREATE TABLE IF NOT EXISTS parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  description TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS parts_category_idx ON parts(category);
CREATE INDEX IF NOT EXISTS parts_brand_idx ON parts(brand);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_parts_updated_at
    BEFORE UPDATE ON parts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;

-- Allow anon role to SELECT
CREATE POLICY allow_anon_select_parts ON parts
  FOR SELECT USING (true); 