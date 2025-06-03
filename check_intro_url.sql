-- Check if intro_url column exists
select column_name from information_schema.columns where table_name = 'modules' and column_name = 'intro_url'; 