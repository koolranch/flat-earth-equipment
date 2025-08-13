/* Verify GREEN rows have structured specs after backfill and print counts */
import { createClient } from '@supabase/supabase-js';
import { filterGreen } from '../../lib/greenFilter.js';

const url=process.env.NEXT_PUBLIC_SUPABASE_URL!; 
const key=(process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_ANON_KEY)!;
const sb=createClient(url,key,{ auth:{ persistSession:false }});

(async()=>{
  console.log('🔍 Verifying GREEN Series structured specs coverage...\n');
  
  const { data, error } = await sb
    .from('parts')
    .select('id,slug,name,voltage,amperage,phase,category_slug')
    .eq('category_slug','battery-chargers')
    .limit(5000);
  if (error) throw error;
  
  const allChargers = data||[];
  const rows = filterGreen(allChargers);
  
  const total = rows.length;
  const withVoltage = rows.filter(r=>r.voltage).length;
  const withAmperage = rows.filter(r=>r.amperage).length;
  const withPhase = rows.filter(r=>r.phase).length;
  const complete = rows.filter(r=>r.voltage && r.amperage && r.phase).length;
  
  const missingV = rows.filter(r=>!r.voltage).length;
  const missingA = rows.filter(r=>!r.amperage).length;
  const missingP = rows.filter(r=>!r.phase).length;
  
  console.log('📊 GREEN Series Coverage Report:');
  console.log(`   Total GREEN chargers: ${total}`);
  console.log(`   Complete specs (V+A+P): ${complete} (${Math.round(complete/total*100)}%)`);
  console.log(`   With voltage: ${withVoltage} (${Math.round(withVoltage/total*100)}%)`);
  console.log(`   With amperage: ${withAmperage} (${Math.round(withAmperage/total*100)}%)`);
  console.log(`   With phase: ${withPhase} (${Math.round(withPhase/total*100)}%)\n`);
  
  console.log('❌ Missing Fields:');
  console.log(`   Missing voltage: ${missingV}`);
  console.log(`   Missing amperage: ${missingA}`);
  console.log(`   Missing phase: ${missingP}\n`);
  
  if (missingV > 0 || missingA > 0) {
    console.log('⚠️  Items needing attention:');
    const incomplete = rows.filter(r => !r.voltage || !r.amperage);
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
  } else {
    console.log('✅ Perfect! All GREEN chargers have voltage and amperage.');
  }
  
  // Quick summary for easy parsing
  console.log('\n📋 Summary Object:');
  console.log(JSON.stringify({ 
    total_green: total, 
    missing_voltage: missingV, 
    missing_amperage: missingA, 
    missing_phase: missingP,
    complete_specs: complete,
    coverage_percent: Math.round(complete/total*100)
  }, null, 2));
})();