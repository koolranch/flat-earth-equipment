/* Enhanced verification with completeness reporting and missing specs CSV export */
import { createClient } from '@supabase/supabase-js';
import { filterGreen } from '../../lib/greenFilter.js';
import { parseFromText } from '../../lib/specsStruct.js';
import fs from 'fs';
import path from 'path';

const url=process.env.NEXT_PUBLIC_SUPABASE_URL!; 
const key=(process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_ANON_KEY)!;
const sb=createClient(url,key,{ auth:{ persistSession:false }});

interface MissingSpecRecord {
  sku: string;
  slug: string;
  name: string;
  brand: string;
  current_voltage: number | null;
  current_amperage: number | null;
  current_phase: string | null;
  parsed_voltage: number | null;
  parsed_amperage: number | null;
  parsed_phase: string | null;
  missing_fields: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

(async()=>{
  console.log('🔍 Verifying GREEN Series structured specs coverage...\n');
  
  const { data, error } = await sb
    .from('parts')
    .select('id,slug,name,description,voltage,amperage,phase,category_slug,sku,brand')
    .eq('category_slug','battery-chargers')
    .limit(5000);
  if (error) throw error;
  
  const allChargers = data||[];
  const rows = filterGreen(allChargers);
  
  console.log(`📊 Found ${allChargers.length} total battery chargers`);
  console.log(`🟢 Filtering to ${rows.length} GREEN Series chargers\n`);
  
  const total = rows.length;
  const withVoltage = rows.filter(r=>r.voltage).length;
  const withAmperage = rows.filter(r=>r.amperage).length;
  const withPhase = rows.filter(r=>r.phase).length;
  const complete = rows.filter(r=>r.voltage && r.amperage && r.phase).length;
  const criticalComplete = rows.filter(r=>r.voltage && r.amperage).length; // V+A is most critical
  
  const missingV = rows.filter(r=>!r.voltage).length;
  const missingA = rows.filter(r=>!r.amperage).length;
  const missingP = rows.filter(r=>!r.phase).length;
  
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
  const missingSpecRecords: MissingSpecRecord[] = [];
  
  if (incomplete.length > 0) {
    console.log('🔍 Analyzing incomplete records with parsing fallback...\n');
    
    for (const item of incomplete) {
      const missing = [];
      if (!item.voltage) missing.push('voltage');
      if (!item.amperage) missing.push('amperage');
      if (!item.phase) missing.push('phase');
      
      // Try parsing to see if we can suggest values
      const parsed = parseFromText(item.slug, item.name, item.description || undefined);
      
      // Determine priority based on how critical the missing fields are
      let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      if (!item.voltage || !item.amperage) priority = 'HIGH'; // Critical for recommendations
      else if (!item.phase) priority = 'MEDIUM'; // Important but not critical
      
      const record: MissingSpecRecord = {
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
      `"${record.name.replace(/"/g, '""')}"`, // Escape quotes
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
    
    // Summary by priority
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
  
  // Final summary for easy parsing
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
})();