// Enhanced GREEN backfill script with dry-run mode and detailed logging
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

// Command line arguments
const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('-d');
const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');

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

// Enhanced parsing function
function parseFromText(slug, name, description) {
  const s = `${slug||''} ${name||''} ${description||''}`.toLowerCase();
  // Support 24/36/48/80/96V and 2–3 digit amps (20A..300A), variants: amp/amps/ampere
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
  console.log(`🔄 Starting GREEN Series structured specs backfill...\n`);
  console.log(`📋 Mode: ${isDryRun ? '🧪 DRY RUN (no changes will be made)' : '🚀 LIVE UPDATE'}`);
  console.log(`📋 Logging: ${verbose ? '📝 VERBOSE' : '📄 STANDARD'}\n`);

  try {
    const { data, error } = await sb
      .from('parts')
      .select('id,slug,name,description,voltage,amperage,phase,category_slug,sku,brand')
      .eq('category_slug','battery-chargers')
      .limit(5000);

    if (error) throw error;

    const allParts = data || [];
    console.log(`📊 Found ${allParts.length} total battery chargers`);

    const rows = filterGreen(allParts);
    console.log(`🟢 Filtering to ${rows.length} GREEN Series chargers\n`);

    const updates = [];
    const updateLog = [];
    let skipCount = 0;
    let updateStats = { voltage: 0, amperage: 0, phase: 0 };

    console.log(`🔍 Analyzing GREEN chargers for missing structured specs...\n`);

    for (const r of rows) {
      const needV = !r.voltage;
      const needA = !r.amperage;
      const needP = !r.phase;

      if (!(needV || needA || needP)) {
        skipCount++;
        if (verbose) console.log(`  ✅ ${r.slug} - already complete`);
        continue;
      }

      const parsed = parseFromText(r.slug, r.name, r.description);
      const before = { voltage: r.voltage, amperage: r.amperage, phase: r.phase };
      const after = {
        voltage: r.voltage ?? parsed.voltage ?? null,
        amperage: r.amperage ?? parsed.amperage ?? null,
        phase: r.phase ?? parsed.phase ?? null,
      };

      const changes = [];
      if (needV && after.voltage) { updateStats.voltage++; changes.push(`V: null → ${after.voltage}`); }
      if (needA && after.amperage) { updateStats.amperage++; changes.push(`A: null → ${after.amperage}`); }
      if (needP && after.phase) { updateStats.phase++; changes.push(`P: null → ${after.phase}`); }

      if (after.voltage !== before.voltage || after.amperage !== before.amperage || after.phase !== before.phase) {
        const updateRecord = {
          id: r.id,
          slug: r.slug,
          name: r.name,
          sku: r.sku || '',
          brand: r.brand || '',
          before,
          after,
          changes
        };

        updateLog.push(updateRecord);
        updates.push({ 
          id: r.id, 
          voltage: after.voltage,
          amperage: after.amperage, 
          phase: after.phase
        });

        const changeStr = changes.join(', ');
        console.log(`  📝 ${r.slug}: ${changeStr}`);

        if (verbose) {
          console.log(`      Name: ${r.name}`);
          console.log(`      SKU: ${r.sku || 'N/A'}`);
          console.log(`      Brand: ${r.brand || 'N/A'}`);
          console.log(`      Parsed: V=${parsed.voltage} A=${parsed.amperage} P=${parsed.phase}`);
          console.log('');
        }
      }
    }

    // Export detailed log
    if (updateLog.length > 0) {
      fs.mkdirSync('reports', { recursive: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const logPath = path.join('reports', `backfill_log_${timestamp}.json`);
      fs.writeFileSync(logPath, JSON.stringify(updateLog, null, 2));
      console.log(`\n📄 Detailed log saved to: ${logPath}`);
    }

    console.log(`\n📈 Backfill Summary:`);
    console.log(`   Products to update: ${updates.length}`);
    console.log(`   Products already complete: ${skipCount}`);
    console.log(`   Fields being updated: voltage=${updateStats.voltage}, amperage=${updateStats.amperage}, phase=${updateStats.phase}`);
    console.log(`   Completion rate: ${Math.round((skipCount / rows.length) * 100)}%\n`);

    if (updates.length === 0) {
      console.log('✅ No updates needed - all GREEN chargers already have structured specs!');
      return;
    }

    if (isDryRun) {
      console.log('🧪 DRY RUN COMPLETE - No changes were made to the database');
      console.log(`📋 To apply these changes, run without --dry-run flag\n`);
      
      // Show sample updates
      console.log('📝 Sample updates that would be applied:');
      updateLog.slice(0, 5).forEach((record, i) => {
        console.log(`   ${i+1}. ${record.slug}`);
        console.log(`      Changes: ${record.changes.join(', ')}`);
      });
      if (updateLog.length > 5) {
        console.log(`   ... and ${updateLog.length - 5} more`);
      }
      return;
    }

    console.log('🚀 Starting batch updates...');
    let successCount = 0;
    for (let i = 0; i < updates.length; i += 100) {  // Smaller batches for safety
      const slice = updates.slice(i, i + 100);
      const batchNum = Math.floor(i/100) + 1;
      const totalBatches = Math.ceil(updates.length/100);
      
      console.log(`   Batch ${batchNum}/${totalBatches}: Updating ${slice.length} records...`);

      try {
        const { error: upErr } = await sb.from('parts').upsert(slice, { onConflict: 'id' });
        if (upErr) throw upErr;
        successCount += slice.length;
        console.log(`   ✅ Batch ${batchNum} complete`);
      } catch (err) {
        console.error(`   ❌ Batch ${batchNum} failed:`, err);
        throw err;
      }
    }

    console.log(`\n🎉 Backfill completed successfully!`);
    console.log(`   Total records updated: ${successCount}`);
    console.log(`   Updated fields: voltage=${updateStats.voltage}, amperage=${updateStats.amperage}, phase=${updateStats.phase}`);
    console.log(`\n📋 Next step: Run verification script to confirm results`);

  } catch (e) {
    console.error('💥 Backfill failed:', e);
    process.exit(1);
  }
}

main();
