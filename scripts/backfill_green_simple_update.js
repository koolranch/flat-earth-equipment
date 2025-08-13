// Simple GREEN backfill with individual updates to handle missing columns gracefully
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

// GREEN detection and parsing functions (same as before)
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

async function checkColumns() {
  console.log('🔍 Checking if structured columns exist...');
  try {
    // Try to query with structured columns
    const { data, error } = await sb
      .from('parts')
      .select('id,voltage,amperage,phase')
      .limit(1);
    
    if (error) {
      console.log(`❌ Structured columns not found: ${error.message}`);
      console.log('📝 Please apply the Phase 1 migration first');
      return false;
    }
    console.log('✅ Structured columns exist');
    return true;
  } catch (e) {
    console.log(`❌ Database error: ${e.message}`);
    return false;
  }
}

async function main() {
  console.log('🔄 Starting GREEN Series structured specs backfill...\n');

  // Check if columns exist
  const columnsExist = await checkColumns();
  if (!columnsExist) {
    console.log('\n🚫 Cannot proceed without structured columns');
    console.log('📋 Next steps:');
    console.log('   1. Apply Phase 1 migration (add voltage/amperage/phase columns)');
    console.log('   2. Re-run this backfill script');
    process.exit(1);
  }

  try {
    // First, try to get records with basic fields
    const { data, error } = await sb
      .from('parts')
      .select('id,slug,name,description,category_slug')
      .eq('category_slug','battery-chargers')
      .limit(5000);

    if (error) throw error;

    const allParts = data || [];
    console.log(`📊 Found ${allParts.length} total battery chargers`);

    const rows = filterGreen(allParts);
    console.log(`🟢 Filtering to ${rows.length} GREEN Series chargers\n`);

    let updateCount = 0;
    let skipCount = 0;

    console.log('🔍 Processing GREEN chargers...\n');

    for (const r of rows) {
      const parsed = parseFromText(r.slug, r.name, r.description);
      
      if (!parsed.voltage || !parsed.amperage || !parsed.phase) {
        console.log(`⚠️  ${r.slug}: Could not parse specs (V=${parsed.voltage} A=${parsed.amperage} P=${parsed.phase})`);
        skipCount++;
        continue;
      }

      try {
        // Update only the structured fields for this specific record
        const { error: updateError } = await sb
          .from('parts')
          .update({
            voltage: parsed.voltage,
            amperage: parsed.amperage,
            phase: parsed.phase
          })
          .eq('id', r.id);

        if (updateError) {
          console.log(`❌ Failed to update ${r.slug}: ${updateError.message}`);
          skipCount++;
        } else {
          console.log(`✅ ${r.slug}: V=${parsed.voltage} A=${parsed.amperage} P=${parsed.phase}`);
          updateCount++;
        }
      } catch (e) {
        console.log(`❌ Error updating ${r.slug}: ${e.message}`);
        skipCount++;
      }
    }

    console.log(`\n📈 Backfill Summary:`);
    console.log(`   Successfully updated: ${updateCount}`);
    console.log(`   Skipped/failed: ${skipCount}`);
    console.log(`   Total GREEN chargers: ${rows.length}`);
    console.log(`   Success rate: ${Math.round((updateCount/rows.length)*100)}%`);

    if (updateCount > 0) {
      console.log(`\n🎉 Backfill completed successfully!`);
      console.log(`📋 Next step: Run verification script to confirm results`);
    } else {
      console.log(`\n⚠️  No records were updated. Check error messages above.`);
    }

  } catch (e) {
    console.error('💥 Backfill failed:', e);
    process.exit(1);
  }
}

main();
