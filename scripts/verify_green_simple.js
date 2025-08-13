// Simple GREEN verification script in JavaScript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

// GREEN detection and parsing functions
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

async function main() {
  console.log('🔍 Verifying GREEN Series structured specs coverage...\n');

  try {
    const { data, error } = await sb
      .from('parts')
      .select('id,slug,name,description,voltage,amperage,phase,category_slug,sku,brand')
      .eq('category_slug','battery-chargers')
      .limit(5000);

    if (error) throw error;

    const allChargers = data || [];
    const rows = filterGreen(allChargers);

    console.log(`📊 Found ${allChargers.length} total battery chargers`);
    console.log(`🟢 Filtering to ${rows.length} GREEN Series chargers\n`);

    const total = rows.length;
    const withVoltage = rows.filter(r => r.voltage).length;
    const withAmperage = rows.filter(r => r.amperage).length;
    const withPhase = rows.filter(r => r.phase).length;
    const complete = rows.filter(r => r.voltage && r.amperage && r.phase).length;
    const criticalComplete = rows.filter(r => r.voltage && r.amperage).length;

    const missingV = rows.filter(r => !r.voltage).length;
    const missingA = rows.filter(r => !r.amperage).length;
    const missingP = rows.filter(r => !r.phase).length;

    console.log('📊 GREEN Series Coverage Report:');
    console.log(`   Total GREEN chargers: ${total}`);
    console.log(`   Complete specs (V+A+P): ${complete} (${Math.round(complete/total*100)}%)`);
    console.log(`   Critical specs (V+A): ${criticalComplete} (${Math.round(criticalComplete/total*100)}%)`);
    console.log(`   With voltage: ${withVoltage} (${Math.round(withVoltage/total*100)}%)`);
    console.log(`   With amperage: ${withAmperage} (${Math.round(withAmperage/total*100)}%)`);
    console.log(`   With phase: ${withPhase} (${Math.round(withPhase/total*100)}%)\n`);

    console.log('❌ Missing Fields:');
    console.log(`   Missing voltage: ${missingV}`);
    console.log(`   Missing amperage: ${missingA}`);
    console.log(`   Missing phase: ${missingP}\n`);

    // Analyze incomplete records
    const incomplete = rows.filter(r => !r.voltage || !r.amperage || !r.phase);
    const missingSpecRecords = [];

    if (incomplete.length > 0) {
      console.log('🔍 Analyzing incomplete records with parsing fallback...\n');

      for (const item of incomplete) {
        const missing = [];
        if (!item.voltage) missing.push('voltage');
        if (!item.amperage) missing.push('amperage');
        if (!item.phase) missing.push('phase');

        const parsed = parseFromText(item.slug, item.name, item.description || undefined);

        let priority = 'LOW';
        if (!item.voltage || !item.amperage) priority = 'HIGH';
        else if (!item.phase) priority = 'MEDIUM';

        const record = {
          sku: item.sku || '',
          slug: item.slug,
          name: item.name,
          brand: item.brand || '',
          current_voltage: item.voltage,
          current_amperage: item.amperage,
          current_phase: item.phase,
          parsed_voltage: parsed.voltage,
          parsed_amperage: parsed.amperage,
          parsed_phase: parsed.phase,
          missing_fields: missing.join(', '),
          priority
        };

        missingSpecRecords.push(record);

        console.log(`   ⚠️  ${item.slug} (${priority})`);
        console.log(`      Missing: ${missing.join(', ')}`);
        console.log(`      Current: V=${item.voltage} A=${item.amperage} P=${item.phase}`);
        console.log(`      Parsed:  V=${parsed.voltage} A=${parsed.amperage} P=${parsed.phase}`);
        console.log('');
      }

      // Export missing specs CSV
      fs.mkdirSync('reports', { recursive: true });
      const csvPath = path.join('reports', 'missing_green_specs.csv');
      const headers = [
        'sku', 'slug', 'name', 'brand', 'current_voltage', 'current_amperage', 'current_phase',
        'parsed_voltage', 'parsed_amperage', 'parsed_phase', 'missing_fields', 'priority'
      ];

      const csvRows = missingSpecRecords.map(record => [
        record.sku,
        record.slug,
        `"${record.name.replace(/"/g, '""')}"`,
        record.brand,
        record.current_voltage || '',
        record.current_amperage || '',
        record.current_phase || '',
        record.parsed_voltage || '',
        record.parsed_amperage || '',
        record.parsed_phase || '',
        record.missing_fields,
        record.priority
      ]);

      const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
      fs.writeFileSync(csvPath, csvContent);

      console.log(`📄 Missing specs report exported to: ${csvPath}`);
      console.log(`📋 Records in report: ${missingSpecRecords.length}\n`);

      const highPriority = missingSpecRecords.filter(r => r.priority === 'HIGH');
      const mediumPriority = missingSpecRecords.filter(r => r.priority === 'MEDIUM');
      const lowPriority = missingSpecRecords.filter(r => r.priority === 'LOW');

      console.log('📈 Priority Breakdown:');
      console.log(`   🔴 HIGH (missing V or A): ${highPriority.length}`);
      console.log(`   🟡 MEDIUM (missing P only): ${mediumPriority.length}`);
      console.log(`   🟢 LOW (other): ${lowPriority.length}\n`);

    } else {
      console.log('✅ Perfect! All GREEN chargers have complete structured specs.\n');
    }

    // Completion status
    const completionRate = Math.round((complete/total)*100);
    const criticalRate = Math.round((criticalComplete/total)*100);

    console.log('🎯 Completion Status:');
    if (completionRate >= 95) {
      console.log(`   ✅ EXCELLENT: ${completionRate}% complete specs`);
    } else if (criticalRate >= 95) {
      console.log(`   ✅ GOOD: ${criticalRate}% critical specs (V+A)`);
      console.log(`   📝 NOTE: ${total - complete} missing phase only`);
    } else {
      console.log(`   ⚠️  NEEDS WORK: ${criticalRate}% critical specs`);
      console.log(`   📝 ACTION: Review missing_green_specs.csv`);
    }

    // Final summary
    console.log('\n📋 Summary Object:');
    console.log(JSON.stringify({ 
      total_green: total, 
      complete_specs: complete,
      critical_complete: criticalComplete,
      completion_rate: completionRate,
      critical_rate: criticalRate,
      missing_voltage: missingV, 
      missing_amperage: missingA, 
      missing_phase: missingP,
      high_priority_missing: missingSpecRecords.filter(r => r.priority === 'HIGH').length,
      csv_exported: incomplete.length > 0,
      status: completionRate >= 95 ? 'EXCELLENT' : criticalRate >= 95 ? 'GOOD' : 'NEEDS_WORK'
    }, null, 2));

  } catch (e) {
    console.error('💥 Verification failed:', e);
    process.exit(1);
  }
}

main();
