-- Add the brand_logo_url column if it doesn't exist
ALTER TABLE parts ADD COLUMN IF NOT EXISTS brand_logo_url TEXT;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_parts_brand_logo_url ON parts(brand_logo_url);

-- Update RLS policies to allow access to brand_logo_url
ALTER POLICY "Enable read access for all users" ON parts
    USING (true);

-- Grant necessary permissions
GRANT SELECT ON parts TO anon;
GRANT SELECT ON parts TO authenticated; 