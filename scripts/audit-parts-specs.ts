/* Node script: audit the database to see which chargers exist by voltage/phase/current buckets. */
import { createClient } from '@supabase/supabase-js';
import { parseSpecsFromSlugSafe } from '../lib/specsDebug.js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const sb = createClient(url, key);

(async () => {
  const { data, error } = await sb
    .from('parts')
    .select('id,slug,name,category_slug')
    .eq('category_slug','battery-chargers')
    .limit(2000);
  if (error) throw error;
  const rows = data || [];
  const buckets: Record<string, number> = {};
  for (const r of rows) {
    const s = parseSpecsFromSlugSafe(r.slug);
    const key = `${s.voltage||'?'}V | ${s.current||'?'}A | ${s.phase||'?'} | ${s.family||'?'} `;
    buckets[key] = (buckets[key] || 0) + 1;
  }
  console.log('Distinct charger spec buckets (count):');
  Object.entries(buckets).sort().forEach(([k,v])=>console.log(v.toString().padStart(3,' '), '-', k));

  // Quick availability questions
  const have36_1p = Object.keys(buckets).some(k => k.startsWith('36V') && k.includes('1P'));
  console.log('\nHas 36V single-phase options?', have36_1p);
})();
