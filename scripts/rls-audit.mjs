import { createClient } from '@supabase/supabase-js';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key){ console.error('Missing Supabase env'); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession:false } });

const skip = new Set(['schema_migrations']);

async function main(){
  const { data: tables } = await sb.rpc('introspect_public_tables');
  const rows = tables.filter(t=> !skip.has(t.table_name)).map(t=> ({
    table: t.table_name, rls: t.rowsecurity, policies: t.policy_count
  }));
  const missing = rows.filter(r=> !r.rls);
  console.table(rows);
  if (missing.length){
    console.error('❌ RLS missing on:', missing.map(m=> m.table).join(', '));
    if (process.env.STRICT_RLS==='1') process.exit(2);
  } else {
    console.log('✅ All public tables have RLS enabled.');
  }
}
main().catch(e=> { console.error(e); process.exit(1); });
