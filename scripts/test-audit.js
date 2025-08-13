// Simple test to verify the audit setup works
console.log('🧪 Testing audit setup...');

// Test the basic functionality
async function testRecommendationAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/recommend-chargers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voltage: 48,
        amps: 75,
        phase: '1P',
        limit: 5
      })
    });
    
    const result = await response.json();
    console.log('✅ API Response:', result.ok ? 'SUCCESS' : 'ERROR');
    console.log('📊 Items returned:', result.items?.length || 0);
    
    if (result.items && result.items.length > 0) {
      console.log('🎯 First result:', result.items[0].slug);
      console.log('🏷️  Match type:', result.items[0].matchType);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Check if dev server is running
testRecommendationAPI();
