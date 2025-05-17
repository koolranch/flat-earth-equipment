-- Add core_charge and has_core_charge columns to parts table
ALTER TABLE parts
ADD COLUMN IF NOT EXISTS core_charge DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS has_core_charge BOOLEAN DEFAULT false;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_parts_core_charge ON parts(core_charge);

-- Update RLS policies to allow access to core_charge
ALTER POLICY "Enable read access for all users" ON parts
    USING (true);

-- Grant necessary permissions
GRANT SELECT ON parts TO anon;
GRANT SELECT ON parts TO authenticated; 