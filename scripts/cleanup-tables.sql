-- First create the exec function if it doesn't exist
CREATE OR REPLACE FUNCTION exec(sql text) RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the incorrect table
DROP TABLE IF EXISTS "Part" CASCADE;

-- Verify the correct table exists
SELECT COUNT(*) FROM parts; 