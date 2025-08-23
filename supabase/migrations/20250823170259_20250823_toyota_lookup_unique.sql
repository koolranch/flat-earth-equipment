-- 20250823_toyota_lookup_unique.sql
-- Add unique index for idempotent Toyota serial lookup seeding

do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname='public' and indexname='toyota_lookup_unique_idx'
  ) then
    execute 'create unique index toyota_lookup_unique_idx
             on public.toyota_serial_lookup (model_code, year, beginning_serial)';
  end if;
end $$;
