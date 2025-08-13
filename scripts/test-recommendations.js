// Simple test script to verify our recommendation fixes
const testPayload = {
  voltage: 36,
  amps: 75, // Standard Overnight for 750Ah battery = 75A
  phase: '1P',
  speed: 'overnight',
  limit: 10
};

console.log('Testing recommendation API with payload:', testPayload);

fetch('http://localhost:3000/api/recommend-chargers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testPayload)
})
.then(r => r.json())
.then(data => {
  console.log('\n=== API Response ===');
  console.log('Status:', data.ok ? 'SUCCESS' : 'FAILED');
  if (data.ok) {
    const best = data.items?.filter(i => i.matchType === 'best') || [];
    const alt = data.items?.filter(i => i.matchType === 'alternate') || [];
    console.log(`Best matches: ${best.length}`);
    console.log(`Alternate matches: ${alt.length}`);
    console.log('\nBest matches:');
    best.slice(0, 3).forEach(item => {
      console.log(`  - ${item.name}: ${item.dc_voltage_v}V, ${item.dc_current_a}A, ${item.input_phase || 'unknown'} (score: ${item.score})`);
    });
    if (alt.length > 0) {
      console.log('\nAlternate matches:');
      alt.slice(0, 3).forEach(item => {
        console.log(`  - ${item.name}: ${item.dc_voltage_v}V, ${item.dc_current_a}A, ${item.input_phase || 'unknown'} (score: ${item.score})`);
      });
    }
  } else {
    console.log('Error:', data.error);
  }
})
.catch(err => console.error('Test failed:', err));
