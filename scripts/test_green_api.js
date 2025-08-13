// Test script for GREEN data quality API
// Run with: node scripts/test_green_api.js

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing GREEN Data Quality API\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/api/recommend-chargers`);
    const health = await healthResponse.json();
    
    console.log('   Status:', health.ok ? '✅' : '❌');
    console.log('   Data Source:', health.dataSource);
    console.log('   Using GREEN View:', health.usingGreenView);
    console.log('   Enabled:', health.enabled);
    console.log('');

    // Test 2: Recommendation request
    console.log('2️⃣ Testing recommendation endpoint...');
    const recResponse = await fetch(`${BASE_URL}/api/recommend-chargers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voltage: 36,
        amps: 75,
        phase: '1P',
        limit: 5
      })
    });

    const rec = await recResponse.json();
    
    if (rec.ok) {
      console.log('   Status: ✅');
      console.log('   Items Found:', rec.items?.length || 0);
      console.log('   Debug Info:', rec.debug || 'No debug info');
      
      if (rec.items?.length > 0) {
        console.log('   Sample Item:');
        const item = rec.items[0];
        console.log('     Slug:', item.slug);
        console.log('     Voltage:', item.voltage || item.dc_voltage_v || 'N/A');
        console.log('     Amperage:', item.amperage || item.dc_current_a || 'N/A');
        console.log('     Phase:', item.phase || item.input_phase || 'N/A');
        console.log('     Match Type:', item.matchType || 'N/A');
      }
    } else {
      console.log('   Status: ❌');
      console.log('   Error:', rec.error);
      console.log('   Hint:', rec.hint);
    }
    console.log('');

    // Test 3: Different scenarios
    const scenarios = [
      { voltage: 24, amps: 60, phase: '1P', name: '24V Single-Phase' },
      { voltage: 48, amps: 100, phase: '3P', name: '48V Three-Phase' },
      { voltage: 80, amps: 150, phase: '3P', name: '80V Three-Phase' }
    ];

    console.log('3️⃣ Testing multiple scenarios...');
    for (const scenario of scenarios) {
      console.log(`   Testing ${scenario.name}...`);
      
      const response = await fetch(`${BASE_URL}/api/recommend-chargers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenario)
      });

      const result = await response.json();
      
      if (result.ok) {
        const bestMatches = result.items?.filter(item => item.matchType === 'best').length || 0;
        const alternates = result.items?.filter(item => item.matchType === 'alternate').length || 0;
        console.log(`     ✅ ${result.items?.length || 0} total (${bestMatches} best, ${alternates} alt)`);
      } else {
        console.log(`     ❌ Error: ${result.error}`);
      }
    }

    console.log('\n🎉 Testing complete!');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the tests
testAPI();
