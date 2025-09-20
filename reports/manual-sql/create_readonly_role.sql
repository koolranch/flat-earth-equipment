-- Create a read-only role for database audits
-- Run this as a superuser/service_role in Supabase SQL editor

-- 1) Create read-only role
create role readonly_audit;

-- 2) Grant connect permission
grant connect on database postgres to readonly_audit;

-- 3) Grant usage on public schema
grant usage on schema public to readonly_audit;

-- 4) Grant select on all existing tables
grant select on all tables in schema public to readonly_audit;

-- 5) Grant select on all future tables
alter default privileges in schema public grant select on tables to readonly_audit;

-- 6) Grant usage on sequences (for accessing table stats)
grant usage on all sequences in schema public to readonly_audit;

-- 7) Create a user for the role (replace with your desired credentials)
create user readonly_user with password 'secure_readonly_password_123';
grant readonly_audit to readonly_user;

-- Your connection string will be:
-- postgres://readonly_user:secure_readonly_password_123@db.your-project.supabase.co:5432/postgres

-- Test the role:
-- set role readonly_audit;
-- select count(*) from courses; -- Should work
-- insert into courses (slug, title, price_cents) values ('test', 'Test', 100); -- Should fail
