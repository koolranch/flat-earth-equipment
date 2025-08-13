// Simple scenarios test using the recommendations API
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:3000';

// Amp calculation function (copied from audit logic)
function ampsFor(voltage, speed) {
  const map = { 24: 600, 36: 750, 48: 750, 80: 1000 };
  const ah = map[voltage];
  const den = speed === 'overnight' ? 10 : 5;
  return ah ? Math.max(10, Math.round(ah / den)) : null;
}

async function post(body) {
  const r = await fetch(`${BASE}/api/recommend-chargers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return r.json();
}

async function runScenariosTest() {
  console.log('🧪 Starting scenario batch testing...\n');
  console.log(`🌐 Testing against: ${BASE}\n`);

  const volts = [24, 36, 48, 80];
  const speeds = ['overnight', 'fast'];
  const phases = ['1P', '3P', null];

  const rows = [];
  const header = ['voltage', 'speed', 'phase', 'target_amps', 'count', 'best', 'alt', 'top_slug', 'top_score', 'top_reasons'];

  let totalTests = 0;
  let successfulTests = 0;

  for (const v of volts) {
    for (const sp of speeds) {
      const amps = ampsFor(v, sp);
      for (const ph of phases) {
        totalTests++;
        console.log(`Testing: ${v}V ${sp} ${ph || 'any-phase'} (~${amps}A)`);

        const body = { voltage: v, amps, phase: ph, limit: 12 };

        try {
          const json = await post(body);

          if (!json.ok) {
            console.log(`  ❌ Error: ${json.error}`);
            rows.push([v, sp, ph ?? '—', amps, 0, 0, 0, 'ERROR', 0, json.error || 'Unknown error']);
            continue;
          }

          const items = (json?.items) || [];
          const best = items.filter((i) => i.matchType === 'best');
          const alt = items.filter((i) => i.matchType !== 'best');
          const top = items[0];

          console.log(`  ✅ ${items.length} results (${best.length} best, ${alt.length} alt)`);

          rows.push([
            v,
            sp,
            ph ?? '—',
            amps,
            items.length,
            best.length,
            alt.length,
            top?.slug || '',
            top?.score || '',
            (top?.reasons || []).slice(0, 2).map((r) => r.label).join(' | ')
          ]);

          successfulTests++;
        } catch (error) {
          console.log(`  ❌ Request failed: ${error.message}`);
          rows.push([v, sp, ph ?? '—', amps, 0, 0, 0, 'FAILED', 0, error.message]);
        }
      }
    }
  }

  // Create reports directory
  fs.mkdirSync('reports', { recursive: true });

  // Write CSV
  fs.writeFileSync(
    path.join('reports', 'recs_scenarios.csv'),
    [header.join(','), ...rows.map(r => r.join(','))].join('\n')
  );

  console.log('\n📊 Test Results Summary:');
  console.log(`   Total scenarios: ${totalTests}`);
  console.log(`   Successful: ${successfulTests}`);
  console.log(`   Failed: ${totalTests - successfulTests}`);

  // Analyze results
  const noResults = rows.filter(r => r[4] === 0).length;
  const noBestMatches = rows.filter(r => r[5] === 0 && r[6] > 0).length;
  const perfectMatches = rows.filter(r => r[5] > 0).length;

  console.log(`   No results: ${noResults}`);
  console.log(`   No best matches (but has alternates): ${noBestMatches}`);
  console.log(`   Has best matches: ${perfectMatches}`);

  // Flag concerning scenarios
  console.log('\n⚠️  Scenarios needing attention:');
  rows.forEach(r => {
    const [voltage, speed, phase, targetAmps, count, best, alt] = r;
    if (count === 0) {
      console.log(`  - ${voltage}V ${speed} ${phase}: NO RESULTS`);
    } else if (best === 0 && alt > 0 && (voltage === 36 || voltage === 48)) {
      console.log(`  - ${voltage}V ${speed} ${phase}: NO BEST MATCHES (${alt} alternates)`);
    }
  });

  console.log('\n✅ Wrote reports/recs_scenarios.csv');
}

runScenariosTest();
