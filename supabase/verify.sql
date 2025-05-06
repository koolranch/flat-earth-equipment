-- Verify table exists
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name = 'parts' AND table_schema = 'public';

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'parts';

-- Verify RLS policies
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'parts';

-- Count parts in the table
SELECT COUNT(*) FROM parts; 