/* Verify GREEN rows have structured specs after backfill and print counts */
import { createClient } from '@supabase/supabase-js';
import { filterGreen } from '../../lib/greenFilter';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!; 
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)!;
const sb = createClient(url, key, { auth: { persistSession: false } });

(async () => {
  console.log('🔍 Verifying GREEN Series structured specs after backfill...\n');
  
  const { data, error } = await sb
    .from('parts')
    .select('id,slug,name,voltage,amperage,phase,category_slug')
    .eq('category_slug','battery-chargers')
    .limit(5000);
    
  if (error) {
    console.error('❌ Error fetching parts:', error);
    throw error;
  }
  
  const allChargers = data || [];
  const greenChargers = filterGreen(allChargers);
  
  const total = greenChargers.length;
  const missingV = greenChargers.filter(r => !r.voltage).length;
  const missingA = greenChargers.filter(r => !r.amperage).length;
  const missingP = greenChargers.filter(r => !r.phase).length;
  const complete = greenChargers.filter(r => r.voltage && r.amperage && r.phase).length;
  
  console.log('📊 GREEN Series Verification Results:');
  console.log(`   Total GREEN chargers: ${total}`);
  console.log(`   Complete specs (V+A+P): ${complete} (${Math.round(complete/total*100)}%)`);
  console.log(`   Missing voltage: ${missingV}`);
  console.log(`   Missing amperage: ${missingA}`);
  console.log(`   Missing phase: ${missingP}\n`);
  
  if (missingV > 0 || missingA > 0) {
    console.log('⚠️  Items needing manual attention:');
    
    const incomplete = greenChargers.filter(r => !r.voltage || !r.amperage);
    incomplete.slice(0, 10).forEach(item => {
      const missing = [];
      if (!item.voltage) missing.push('voltage');
      if (!item.amperage) missing.push('amperage');
      if (!item.phase) missing.push('phase');
      console.log(`   - ${item.slug} (missing: ${missing.join(', ')})`);
    });
    
    if (incomplete.length > 10) {
      console.log(`   ... and ${incomplete.length - 10} more`);
    }
    
    console.log('\n💡 Recommendation: Review these items in Supabase and update manually if needed.');
  } else {
    console.log('✅ All GREEN Series chargers have complete structured specs!');
  }
  
  // Voltage distribution
  const voltageDistribution = greenChargers.reduce((acc: Record<string, number>, item) => {
    const key = item.voltage ? `${item.voltage}V` : 'Missing';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n📈 Voltage Distribution:');
  Object.entries(voltageDistribution)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([voltage, count]) => {
      console.log(`   ${voltage}: ${count} chargers`);
    });
    
  // Amperage distribution
  const amperageDistribution = greenChargers.reduce((acc: Record<string, number>, item) => {
    const key = item.amperage ? `${item.amperage}A` : 'Missing';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n⚡ Top Amperage Values:');
  Object.entries(amperageDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .forEach(([amperage, count]) => {
      console.log(`   ${amperage}: ${count} chargers`);
    });
    
  // Phase distribution
  const phaseDistribution = greenChargers.reduce((acc: Record<string, number>, item) => {
    const key = item.phase || 'Missing';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n🔌 Phase Distribution:');
  Object.entries(phaseDistribution).forEach(([phase, count]) => {
    console.log(`   ${phase}: ${count} chargers`);
  });
})();
