-- First verify we're working with the correct table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'parts'
  ) THEN
    RAISE EXCEPTION 'Table "parts" does not exist!';
  END IF;
END $$;

-- Backup the table structure (just in case)
CREATE TABLE IF NOT EXISTS parts_backup (LIKE parts INCLUDING ALL);

-- Truncate the table
TRUNCATE TABLE parts;

-- Verify the table is empty but exists
SELECT COUNT(*) as row_count FROM parts;

-- Show table structure is preserved
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'parts'
ORDER BY ordinal_position; 