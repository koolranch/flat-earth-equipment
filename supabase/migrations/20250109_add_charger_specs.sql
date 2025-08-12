-- Migration: Add charger specification fields to parts table
-- Date: 2025-01-09
-- Purpose: Add structured fields for battery charger specifications to improve recommendation logic

ALTER TABLE parts
  ADD COLUMN IF NOT EXISTS dc_voltage_v INTEGER,
  ADD COLUMN IF NOT EXISTS dc_current_a INTEGER,
  ADD COLUMN IF NOT EXISTS input_phase TEXT CHECK (input_phase IN ('1P', '3P')),
  ADD COLUMN IF NOT EXISTS chemistry_support TEXT[],
  ADD COLUMN IF NOT EXISTS quick_ship BOOLEAN DEFAULT false;

-- Create indexes for filtering and performance
CREATE INDEX IF NOT EXISTS idx_parts_dc_voltage ON parts(dc_voltage_v);
CREATE INDEX IF NOT EXISTS idx_parts_dc_current ON parts(dc_current_a);
CREATE INDEX IF NOT EXISTS idx_parts_input_phase ON parts(input_phase);
CREATE INDEX IF NOT EXISTS idx_parts_quick_ship ON parts(quick_ship);

-- Update RLS policies to include new columns
ALTER POLICY "Enable read access for all users" ON parts
    USING (true);

-- Comment the table for documentation
COMMENT ON COLUMN parts.dc_voltage_v IS 'DC output voltage in volts (e.g., 24, 36, 48, 80)';
COMMENT ON COLUMN parts.dc_current_a IS 'DC output current in amperes (e.g., 20, 35, 45)';
COMMENT ON COLUMN parts.input_phase IS 'Input power phase: 1P for single-phase, 3P for three-phase';
COMMENT ON COLUMN parts.chemistry_support IS 'Array of supported battery chemistries (e.g., [Lead-Acid, AGM, Lithium])';
COMMENT ON COLUMN parts.quick_ship IS 'Whether this product qualifies for quick shipping';
