-- Add vendor tracking and metadata columns to parts table
ALTER TABLE parts 
  ADD COLUMN IF NOT EXISTS vendor_sku TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_parts_vendor_sku ON parts(vendor_sku);
CREATE INDEX IF NOT EXISTS idx_parts_metadata ON parts USING GIN(metadata);

-- Add helpful comments
COMMENT ON COLUMN parts.vendor_sku IS 'Supplier part number for internal ordering (e.g., Helmar FM-1-200)';
COMMENT ON COLUMN parts.metadata IS 'Structured product specifications and additional data';

