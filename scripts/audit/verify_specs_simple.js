// Simple verification script using the export API to check structured specs
const fs = require('fs');

async function verifySpecs() {
  console.log('🔍 Verifying structured specs via API...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/debug/recs/export');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const csvData = await response.text();
    const lines = csvData.split('\n');
    const header = lines[0];
    const rows = lines.slice(1).filter(line => line.trim());
    
    console.log(`📊 Found ${rows.length} GREEN Series chargers`);
    console.log(`📋 CSV Headers: ${header}\n`);
    
    // Analyze first few rows
    console.log('📝 Sample data (first 5 rows):');
    rows.slice(0, 5).forEach((row, idx) => {
      const [id, slug, name, voltage, current, phase, family, price, bucket] = row.split(',');
      console.log(`   ${idx + 1}. ${slug}`);
      console.log(`      Voltage: ${voltage || 'Missing'}`);
      console.log(`      Current: ${current || 'Missing'}`);
      console.log(`      Phase: ${phase || 'Missing'}`);
      console.log(`      Family: ${family || 'Missing'}\n`);
    });
    
    // Quick stats
    const withVoltage = rows.filter(row => {
      const voltage = row.split(',')[3];
      return voltage && voltage !== '';
    }).length;
    
    const withCurrent = rows.filter(row => {
      const current = row.split(',')[4];
      return current && current !== '';
    }).length;
    
    const withPhase = rows.filter(row => {
      const phase = row.split(',')[5];
      return phase && phase !== '';
    }).length;
    
    console.log('📈 Quick Stats:');
    console.log(`   With voltage: ${withVoltage}/${rows.length} (${Math.round(withVoltage/rows.length*100)}%)`);
    console.log(`   With current: ${withCurrent}/${rows.length} (${Math.round(withCurrent/rows.length*100)}%)`);
    console.log(`   With phase: ${withPhase}/${rows.length} (${Math.round(withPhase/rows.length*100)}%)`);
    
    if (withVoltage === rows.length && withCurrent === rows.length) {
      console.log('\n✅ All GREEN Series chargers have structured specs!');
    } else {
      console.log(`\n⚠️  ${rows.length - Math.min(withVoltage, withCurrent)} chargers need attention`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifySpecs();
