-- First verify if the table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'Part'
  ) THEN
    -- Drop the table if it exists
    DROP TABLE IF EXISTS "Part" CASCADE;
    RAISE NOTICE 'Successfully dropped the "Part" table';
  ELSE
    RAISE NOTICE 'Table "Part" does not exist, no action needed';
  END IF;
END $$;

-- Verify the table is gone
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'Part'; 