import pg from 'pg';

const CONN = process.env.SUPABASE_DB_URL || '';
if (!CONN) { 
  console.error('Missing SUPABASE_DB_URL for local audit.'); 
  process.exit(1); 
}
const client = new pg.Client({ connectionString: CONN });

const SQL = `
with rels as (
  select n.nspname, c.relname, c.relrowsecurity
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname='public' and c.relkind='r'
), pol as (
  select schemaname, tablename, policyname, cmd
  from pg_policies where schemaname='public'
)
select r.nspname as schema, r.relname as table,
       r.relrowsecurity as rls_enabled,
       coalesce(
         (select bool_or(cmd='SELECT') from pol p where p.tablename=r.relname), false
       ) as has_select_policy
from rels r
order by 1,2;`;

(async () => {
  await client.connect();
  const { rows } = await client.query(SQL);
  let warn = false;
  for (const row of rows) {
    if (!row.rls_enabled || !row.has_select_policy) {
      warn = true;
      console.log('RLS CHECK:', row);
    }
  }
  await client.end();
  if (warn) { 
    process.exit(2); 
  }
  console.log('RLS audit OK');
})();
