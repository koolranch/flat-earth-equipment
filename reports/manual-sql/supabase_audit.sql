-- Paste into Supabase SQL editor (READ-ONLY).
-- Tables
select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by 1;

-- RLS flags
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind='r' order by 1;

-- Policies
select schemaname, tablename, policyname, cmd from pg_policies where schemaname='public' order by tablename, policyname;

-- Foreign Keys
select tc.table_name, kcu.column_name, ccu.table_name as ref_table, ccu.column_name as ref_column
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu on tc.constraint_name=kcu.constraint_name and tc.table_schema=kcu.table_schema
join information_schema.constraint_column_usage ccu on ccu.constraint_name=tc.constraint_name and ccu.table_schema=tc.table_schema
where tc.table_schema='public' and tc.constraint_type='FOREIGN KEY' order by 1,2;

-- Triggers
select event_object_table as table_name, trigger_name, action_timing, event_manipulation
from information_schema.triggers where trigger_schema='public' order by 1,2;

-- Functions
select p.proname as function_name from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' order by 1;
