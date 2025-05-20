-- Create part_variants table
CREATE TABLE IF NOT EXISTS part_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  firmware_version TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  price_cents INTEGER NOT NULL,
  stripe_price_id TEXT,
  has_core_charge BOOLEAN DEFAULT false,
  core_charge DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS part_variants_part_id_idx ON part_variants(part_id);
CREATE INDEX IF NOT EXISTS part_variants_firmware_version_idx ON part_variants(firmware_version);

-- Create updated_at trigger
CREATE OR REPLACE TRIGGER update_part_variants_updated_at
    BEFORE UPDATE ON part_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE part_variants ENABLE ROW LEVEL SECURITY;

-- Allow anon role to SELECT
CREATE POLICY allow_anon_select_part_variants ON part_variants
    FOR SELECT USING (true);

-- Grant necessary permissions
GRANT SELECT ON part_variants TO anon;
GRANT SELECT ON part_variants TO authenticated; 