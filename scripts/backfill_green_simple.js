// Simple GREEN backfill script in JavaScript
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

// GREEN detection functions
function isGreenSlug(slug) {
  if (!slug) return false;
  const s = slug.toLowerCase();
  return s.startsWith('green') || /\bgreen(2|4|6|8|x)\b/.test(s);
}

function isGreenName(name) {
  if (!name) return false;
  return /\bgreen\b/.test(name.toLowerCase());
}

function filterGreen(rows) {
  return rows.filter(r => isGreenSlug(r.slug) || isGreenName(r.name));
}

// Parsing function
function parseFromText(slug, name, description) {
  const s = `${slug||''} ${name||''} ${description||''}`.toLowerCase();
  const v = s.match(/\b(24|36|48|80|96)\s*v\b/);
  const a = s.match(/\b(\d{2,3})\s*a(?:mps?|mp|mpere|mpers)?\b/);
  const fam = s.match(/green(2|4|6|8|x)\b/);
  const family = fam ? `green${fam[1]}` : null;
  let phase = null;
  if (family === 'green2' || family === 'green4') phase = '1P';
  if (family === 'green6' || family === 'green8' || family === 'greenx') phase = '3P';
  return {
    voltage: v ? Number(v[1]) : null,
    amperage: a ? Number(a[1]) : null,
    phase,
    family
  };
}

async function main() {
  console.log('🔄 Starting GREEN Series structured specs backfill...\n');

  try {
    const { data, error } = await sb
      .from('parts')
      .select('id,slug,name,description,voltage,amperage,phase,category_slug')
      .eq('category_slug','battery-chargers')
      .limit(5000);

    if (error) throw error;

    const allParts = data || [];
    console.log(`📊 Found ${allParts.length} total battery chargers`);

    const rows = filterGreen(allParts);
    console.log(`🟢 Filtering to ${rows.length} GREEN Series chargers\n`);

    const updates = [];
    let skipCount = 0;
    let updateStats = { voltage: 0, amperage: 0, phase: 0 };

    for (const r of rows) {
      const needV = !r.voltage;
      const needA = !r.amperage;
      const needP = !r.phase;

      if (!(needV || needA || needP)) {
        skipCount++;
        continue;
      }

      const parsed = parseFromText(r.slug, r.name, r.description);
      const next = {
        id: r.id,
        voltage: r.voltage ?? parsed.voltage ?? null,
        amperage: r.amperage ?? parsed.amperage ?? null,
        phase: r.phase ?? parsed.phase ?? null,
      };

      // Track what we're updating
      if (needV && next.voltage) updateStats.voltage++;
      if (needA && next.amperage) updateStats.amperage++;
      if (needP && next.phase) updateStats.phase++;

      if (next.voltage !== r.voltage || next.amperage !== r.amperage || next.phase !== r.phase) {
        updates.push(next);
        console.log(`  📝 ${r.slug}: ${needV ? `V=${next.voltage}` : ''} ${needA ? `A=${next.amperage}` : ''} ${needP ? `P=${next.phase}` : ''}`);
      }
    }

    console.log(`\n📈 Backfill Summary:`);
    console.log(`   Products to update: ${updates.length}`);
    console.log(`   Products already complete: ${skipCount}`);
    console.log(`   Fields being updated: voltage=${updateStats.voltage}, amperage=${updateStats.amperage}, phase=${updateStats.phase}\n`);

    if (updates.length === 0) {
      console.log('✅ No updates needed - all GREEN chargers already have structured specs!');
      return;
    }

    console.log('🚀 Starting batch updates...');
    for (let i = 0; i < updates.length; i += 500) {
      const slice = updates.slice(i, i + 500);
      console.log(`   Batch ${Math.floor(i/500) + 1}: Updating ${slice.length} records...`);
      const { error: upErr } = await sb.from('parts').upsert(slice, { onConflict: 'id' });
      if (upErr) throw upErr;
      console.log(`   ✅ Batch complete`);
    }

    console.log(`\n🎉 Backfill completed successfully!`);
    console.log(`   Total records updated: ${updates.length}`);

  } catch (e) {
    console.error('💥 Backfill failed:', e);
    process.exit(1);
  }
}

main();
