// READ-ONLY Supabase/Postgres audit. No writes.
import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

/* === BEGIN local env loader === */
function loadEnvLocal() {
  try {
    const p = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(p)) return;
    const txt = fs.readFileSync(p, 'utf8');
    for (const raw of txt.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const i = line.indexOf('=');
      if (i === -1) continue;
      const k = line.slice(0, i).trim();
      let v = line.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {/* ignore */}
}
loadEnvLocal();
/* === END local env loader === */

const uri = process.env.READONLY_PG_URI;
if (!uri || uri.includes('REPLACE_WITH') || uri.includes('PROJECT-REF')) {
  console.log(`
NO READ-ONLY URI FOUND.
Set READONLY_PG_URI in .env.local (see .env.local.example).
Alternatively run the manual SQL from reports/manual-sql/supabase_audit.sql in Supabase Studio.
`);
  process.exit(0);
}

const OUT_DIR = 'reports';
const TS = new Date().toISOString().replace(/[:.]/g, '-');
const JSON_OUT = path.join(OUT_DIR, `supabase-audit-${TS}.json`);
const MD_OUT = path.join(OUT_DIR, `supabase-audit-${TS}.md`);

(async () => {
  const db = new Client({ connectionString: uri, ssl: { rejectUnauthorized: false } });
  await db.connect();

  // 1) Tables in public schema (exclude Supabase/internal schemas)
  const tables = await db.query(`
    select t.table_name
    from information_schema.tables t
    where t.table_schema = 'public' and t.table_type = 'BASE TABLE'
    order by 1;
  `);

  // Utility helpers
  const q = (s: string) => db.query(s);
  const safeIdent = (n: string) => n.replace(/[^a-zA-Z0-9_]/g, '');

  // 2) Policies, triggers, functions, relations
  const policies = await q(`
    select policyname as policy_name, schemaname, tablename, cmd, qual, with_check
    from pg_policies
    where schemaname = 'public'
    order by tablename, policyname;
  `);
  const rlsFlags = await q(`
    select c.relname as table_name, c.relrowsecurity as rls_enabled
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
    order by 1;
  `);
  const triggers = await q(`
    select event_object_table as table_name, trigger_name, action_timing, event_manipulation
    from information_schema.triggers
    where trigger_schema = 'public'
    order by 1,2;
  `);
  const functions = await q(`
    select p.proname as function_name
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
    order by 1;
  `);
  const fkeys = await q(`
    select
      tc.table_name as table_name,
      kcu.column_name as column_name,
      ccu.table_name as ref_table,
      ccu.column_name as ref_column
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu
      on tc.constraint_name = kcu.constraint_name and tc.table_schema = kcu.table_schema
    join information_schema.constraint_column_usage ccu
      on ccu.constraint_name = tc.constraint_name and ccu.table_schema = tc.table_schema
    where tc.table_schema = 'public' and tc.constraint_type = 'FOREIGN KEY'
    order by 1,2;
  `);

  // 3) Per-table quick facts (row estimate, PKs, updated_at/created_at, recent samples)
  const tableFacts: Record<string, any> = {};
  for (const row of tables.rows) {
    const t = safeIdent(row.table_name);
    const pk = await q(`
      select kcu.column_name
      from information_schema.table_constraints tc
      join information_schema.key_column_usage kcu
        on tc.constraint_name = kcu.constraint_name and tc.table_schema = kcu.table_schema
      where tc.table_schema='public' and tc.table_name='${t}' and tc.constraint_type='PRIMARY KEY'
      order by kcu.ordinal_position;
    `);
    const cols = await q(`
      select column_name, data_type
      from information_schema.columns
      where table_schema='public' and table_name='${t}'
      order by ordinal_position;
    `);
    const stat = await q(`
      select reltuples::bigint as est_rows
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname='public' and c.relname='${t}'
      limit 1;
    `);
    const hasUpdated = cols.rows.some(c => c.column_name === 'updated_at');
    const hasCreated = cols.rows.some(c => c.column_name === 'created_at');
    let sampleSql = `select * from public.${t} limit 3`;
    if (hasUpdated) sampleSql = `select * from public.${t} order by updated_at desc nulls last limit 3`;
    else if (hasCreated) sampleSql = `select * from public.${t} order by created_at desc nulls last limit 3`;
    let samples: any[] = [];
    try {
      const res = await q(sampleSql);
      samples = res.rows;
    } catch { /* some tables may be RLS-blocked even for read-only role */ }

    tableFacts[t] = {
      primary_keys: pk.rows.map(r => r.column_name),
      columns: cols.rows,
      est_rows: stat.rows[0]?.est_rows ?? null,
      recent_samples: samples
    };
  }

  // Bundle
  const bundle = {
    generated_at: new Date().toISOString(),
    tables: tables.rows.map(r => r.table_name),
    table_facts: tableFacts,
    policies: policies.rows,
    rls: rlsFlags.rows,
    triggers: triggers.rows,
    functions: functions.rows,
    foreign_keys: fkeys.rows
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(JSON_OUT, JSON.stringify(bundle, null, 2));

  // Markdown summary
  const md = [
    `# Supabase Audit (read-only)`,
    `Generated: ${bundle.generated_at}`,
    `\n## Tables (${bundle.tables.length})`,
    ...bundle.tables.map(t => `- ${t} — ~${bundle.table_facts[t]?.est_rows ?? 'n/a'} rows`),
    `\n## Notable Families`,
    `- exam_*: papers, sessions, attempts, blueprints, settings`,
    `- eval_* / employer_*: evaluations, submissions`,
    `- org_* / company_seats / org_seats`,
    `- profiles`,
    `- courses / modules / enrollments / quiz_attempts`,
    `\n## RLS (by table)`,
    ...bundle.rls.map((r:any) => `- ${r.table_name}: rls=${r.rls_enabled}`),
    `\n## Policies (${bundle.policies.length})`,
    ...bundle.policies.slice(0, 50).map((p:any) => `- ${p.tablename}: ${p.policy_name} (${p.cmd})`),
    `\n## Foreign Keys (${bundle.foreign_keys.length})`,
    ...bundle.foreign_keys.slice(0, 50).map((f:any) => `- ${f.table_name}.${f.column_name} -> ${f.ref_table}.${f.ref_column}`)
  ].join('\n');

  fs.writeFileSync(MD_OUT, md);
  console.log(`\nWrote:\n- ${MD_OUT}\n- ${JSON_OUT}\n`);
  await db.end();
})();
