// Simple coverage test using fetch to the export endpoint
const fs = require('fs');
const path = require('path');

async function runCoverageTest() {
  console.log('🔍 Starting GREEN Series catalog coverage test via API...\n');
  
  try {
    // Use the export endpoint to get data
    const response = await fetch('http://localhost:3000/api/debug/recs/export');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const csvData = await response.text();
    const lines = csvData.split('\n');
    const header = lines[0];
    const rows = lines.slice(1).filter(line => line.trim());
    
    console.log(`📊 Found ${rows.length} GREEN Series battery chargers in catalog\n`);
    
    // Parse CSV and analyze
    const buckets = {};
    const anomalies = [];
    
    rows.forEach(row => {
      const [id, slug, name, voltage, current, phase, family, price, bucket] = row.split(',');
      
      // Count buckets
      if (bucket) {
        buckets[bucket] = (buckets[bucket] || 0) + 1;
      }
      
      // Flag missing specs
      if (!voltage || !current) {
        anomalies.push(`MISSING_SPEC ${slug} v=${voltage} a=${current}`);
      }
      
      // Flag phase mismatches  
      if (family === 'green2' && phase !== '1P') {
        anomalies.push(`PHASE_MISMATCH ${slug} expected 1P`);
      }
      if ((family === 'green6' || family === 'green8' || family === 'greenx') && phase !== '3P') {
        anomalies.push(`PHASE_MISMATCH ${slug} expected 3P`);
      }
    });
    
    // Save the CSV
    fs.mkdirSync('reports', { recursive: true });
    fs.writeFileSync(path.join('reports', 'recs_coverage.csv'), csvData);
    
    // Console output
    console.log('📈 Coverage buckets (count):');
    Object.entries(buckets)
      .sort()
      .forEach(([k, v]) => console.log(String(v).padStart(3, ' '), k));
    
    console.log(`\n⚠️  Anomalies found: ${anomalies.length}`);
    anomalies.slice(0, 50).forEach(a => console.log('  -', a));
    
    if (anomalies.length > 50) {
      console.log(`  ... and ${anomalies.length - 50} more`);
    }
    
    console.log('\n✅ Wrote reports/recs_coverage.csv');
    console.log('\n📋 Summary:');
    console.log(`   Total products: ${rows.length}`);
    console.log(`   Unique buckets: ${Object.keys(buckets).length}`);
    console.log(`   Anomalies: ${anomalies.length}`);
    console.log(`   Missing specs: ${anomalies.filter(a => a.includes('MISSING_SPEC')).length}`);
    console.log(`   Phase mismatches: ${anomalies.filter(a => a.includes('PHASE_MISMATCH')).length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runCoverageTest();
