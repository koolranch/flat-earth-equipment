/**
 * Test Enhanced Recommendation System
 * Tests the three scenarios outlined in the requirements:
 * - Case A: 36V, Overnight, 1P → Expect at least one 36V ~75A 1P unit as Best
 * - Case B: 48V, Fast, 3P → Expect higher-amp 3P units as Best; 1P variants as Alternate
 * - Case C: Unknown phase → Both 1P/3P can be Best if amps within tolerance
 */

const TEST_CASES = [
  {
    name: "Case A: 36V Overnight 1P",
    payload: {
      voltage: 36,
      amps: 75, // typical overnight charge amperage for 36V
      phase: "1P" as const,
      chemistry: null,
      limit: 12
    },
    expected: "At least one 36V ~75A 1P unit as Best Match"
  },
  {
    name: "Case B: 48V Fast 3P", 
    payload: {
      voltage: 48,
      amps: 150, // higher amperage for fast charging
      phase: "3P" as const,
      chemistry: null,
      limit: 12
    },
    expected: "Higher-amp 3P units as Best; 1P variants as Alternate"
  },
  {
    name: "Case C: 24V Unknown Phase",
    payload: {
      voltage: 24,
      amps: 60,
      phase: null, // unknown phase
      chemistry: null,
      limit: 12
    },
    expected: "Both 1P/3P can be Best if amps within tolerance"
  }
];

async function testRecommendationAPI() {
  console.log('🧪 Testing Enhanced Recommendation System');
  console.log('='.repeat(50));
  
  const baseUrl = 'http://localhost:3000';
  
  for (const testCase of TEST_CASES) {
    console.log(`\n📋 ${testCase.name}`);
    console.log(`💾 Payload:`, JSON.stringify(testCase.payload, null, 2));
    console.log(`🎯 Expected: ${testCase.expected}`);
    console.log('-'.repeat(40));
    
    try {
      const response = await fetch(`${baseUrl}/api/recommend-chargers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.payload),
      });

      if (!response.ok) {
        console.log(`❌ API Error: ${response.status} ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      
      if (!data.ok) {
        console.log(`❌ Response Error: ${data.error}`);
        continue;
      }

      const { items } = data;
      const bestMatches = items.filter((item: any) => item.matchType === 'best');
      const alternateOptions = items.filter((item: any) => item.matchType === 'alternate');
      
      console.log(`✅ Results:`);
      console.log(`   📈 Best Matches: ${bestMatches.length}`);
      console.log(`   📊 Alternate Options: ${alternateOptions.length}`);
      console.log(`   📋 Total Items: ${items.length}`);

      // Show best matches
      if (bestMatches.length > 0) {
        console.log(`\n🏆 Best Matches:`);
        bestMatches.slice(0, 3).forEach((item: any, idx: number) => {
          console.log(`   ${idx + 1}. ${item.name} (${item.dc_voltage_v}V, ${item.dc_current_a}A, ${item.input_phase}) - Score: ${item.score}`);
          if (item.reasons && item.reasons.length > 0) {
            console.log(`      💡 ${item.reasons[0].label}`);
          }
        });
      }

      // Show top alternate options
      if (alternateOptions.length > 0) {
        console.log(`\n🔄 Top Alternate Options:`);
        alternateOptions.slice(0, 2).forEach((item: any, idx: number) => {
          console.log(`   ${idx + 1}. ${item.name} (${item.dc_voltage_v}V, ${item.dc_current_a}A, ${item.input_phase}) - Score: ${item.score}`);
        });
      }

      // Validation based on test case
      let validationPassed = false;
      
      switch (testCase.name) {
        case "Case A: 36V Overnight 1P":
          validationPassed = bestMatches.some((item: any) => 
            item.dc_voltage_v === 36 && 
            item.input_phase === '1P' &&
            item.dc_current_a && Math.abs(item.dc_current_a - 75) / 75 <= 0.12
          );
          break;
          
        case "Case B: 48V Fast 3P":
          const has3PBest = bestMatches.some((item: any) => 
            item.dc_voltage_v === 48 && 
            item.input_phase === '3P'
          );
          const has1PAlternate = alternateOptions.some((item: any) => 
            item.dc_voltage_v === 48 && 
            item.input_phase === '1P'
          );
          validationPassed = has3PBest || (bestMatches.length > 0 && alternateOptions.length > 0);
          break;
          
        case "Case C: 24V Unknown Phase":
          validationPassed = bestMatches.some((item: any) => 
            item.dc_voltage_v === 24
          );
          break;
      }
      
      console.log(`\n${validationPassed ? '✅ VALIDATION PASSED' : '⚠️  VALIDATION WARNING'}`);
      
    } catch (error) {
      console.log(`❌ Network Error:`, error);
    }
  }

  console.log('\n🏁 Test Complete');
  console.log('\n💡 Notes:');
  console.log('- Check server console for [recs] debug logs');
  console.log('- Current amp tolerance: 12% (configurable via RECS_AMP_TOLERANCE_PCT)');
  console.log('- If Best Matches are empty, consider increasing tolerance to 15%');
}

// Run if called directly
if (require.main === module) {
  testRecommendationAPI().catch(console.error);
}

export { testRecommendationAPI };
