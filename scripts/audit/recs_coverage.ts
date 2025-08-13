/* Audits catalog coverage and flags anomalies. Output: reports/recs_coverage.csv + summary in console. */
import fs from 'fs'; 
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { parseSpecsFromSlugAudit, bucketKey } from '../../lib/specsAudit';
import { filterGreen } from '../../lib/greenFilter';

const url=process.env.NEXT_PUBLIC_SUPABASE_URL!; 
const key=(process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_ANON_KEY)!;
const sb=createClient(url,key,{ auth:{ persistSession:false }});

(async()=>{
  console.log('🔍 Starting catalog coverage audit...\n');
  
  const { data, error } = await sb
    .from('parts')
    .select('id,slug,name,price_cents,category_slug')
    .eq('category_slug','battery-chargers')
    .limit(2000);
    
  if(error) throw error; 
  const rowsAll=data||[];
  // Apply GREEN-only filter to restrict audit to FSIP GREEN Series only
  const rows=filterGreen(rowsAll);
  
  console.log(`📊 Found ${rowsAll.length} total battery chargers, ${rows.length} GREEN Series in catalog\n`);
  
  const buckets:Record<string,number>={}; 
  const anomalies:string[]=[];
  const out=[['id','slug','name','voltage','current','phase','family','price_cents','bucket']];
  
  for(const r of rows){
    const s=parseSpecsFromSlugAudit(r.slug);
    
    // Flag missing specs
    if(!s.voltage||!s.current) {
      anomalies.push(`MISSING_SPEC ${r.slug} v=${s.voltage} a=${s.current}`);
    }
    
    // Flag phase mismatches
    if(s.family==='green2'&&s.phase!=='1P') {
      anomalies.push(`PHASE_MISMATCH ${r.slug} expected 1P`);
    }
    if((s.family==='green6'||s.family==='green8'||s.family==='greenx')&&s.phase!=='3P') {
      anomalies.push(`PHASE_MISMATCH ${r.slug} expected 3P`);
    }
    
    const key=bucketKey(s); 
    buckets[key]=(buckets[key]||0)+1;
    
    out.push([
      r.id,
      r.slug,
      r.name, 
      String(s.voltage??''), 
      String(s.current??''), 
      String(s.phase??''), 
      String(s.family??''), 
      String(r.price_cents??''), 
      key
    ]);
  }
  
  // Create reports directory
  fs.mkdirSync('reports',{recursive:true});
  
  // Write CSV
  fs.writeFileSync(
    path.join('reports','recs_coverage.csv'), 
    out.map(r=>r.join(',')).join('\n')
  );
  
  // Console output
  console.log('📈 Coverage buckets (count):');
  Object.entries(buckets)
    .sort()
    .forEach(([k,v])=>console.log(String(v).padStart(3,' '), k));
  
  console.log(`\n⚠️  Anomalies found: ${anomalies.length}`);
  anomalies.slice(0,50).forEach(a=>console.log('  -',a));
  
  if(anomalies.length > 50) {
    console.log(`  ... and ${anomalies.length - 50} more`);
  }
  
  console.log('\n✅ Wrote reports/recs_coverage.csv');
  console.log('\n📋 Summary:');
  console.log(`   Total products: ${rows.length}`);
  console.log(`   Unique buckets: ${Object.keys(buckets).length}`);
  console.log(`   Anomalies: ${anomalies.length}`);
  console.log(`   Missing specs: ${anomalies.filter(a=>a.includes('MISSING_SPEC')).length}`);
  console.log(`   Phase mismatches: ${anomalies.filter(a=>a.includes('PHASE_MISMATCH')).length}`);
})();
