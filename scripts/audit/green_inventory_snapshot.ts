/* Snapshot GREEN inventory from Supabase → CSV with counts per V/A/phase. */
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)!;
const sb = createClient(url, key, { auth: { persistSession: false } });

(async () => {
  const { data, error } = await sb.from('green_chargers').select('slug, name, voltage, amperage, phase').order('slug', { ascending: true });
  if (error) throw error;
  const rows = data || [];
  const grouped: Record<string, number> = {};
  for (const r of rows) {
    const k = `${r.voltage}V|${r.amperage}A|${r.phase}`;
    grouped[k] = (grouped[k] || 0) + 1;
  }
  const lines = ['voltage,amperage,phase,count'];
  Object.entries(grouped).sort().forEach(([k, v]) => {
    const [vlt, amp, ph] = k.split('|');
    lines.push([vlt, amp, ph, v].join(','));
  });
  fs.mkdirSync('reports', { recursive: true });
  const p1 = path.join('reports', 'green_inventory_snapshot.csv');
  fs.writeFileSync(p1, lines.join('\n'));
  console.log('Snapshot:', p1, 'Total items:', rows.length);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
