/* Enhanced backfill for GREEN chargers with dry-run mode and detailed logging */
import { createClient } from '@supabase/supabase-js';
import { filterGreen } from '../../lib/greenFilter.js';
import { parseFromText } from '../../lib/specsStruct.js';
import fs from 'fs';
import path from 'path';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)!;
const sb = createClient(url, key, { auth: { persistSession: false } });

// Command line arguments
const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('-d');
const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');

interface UpdateRecord {
  id: string;
  slug: string;
  name: string;
  before: { voltage: any; amperage: any; phase: any };
  after: { voltage: any; amperage: any; phase: any };
  changes: string[];
}

async function main(){
  console.log(`🔄 Starting GREEN Series structured specs backfill...\n`);
  console.log(`📋 Mode: ${isDryRun ? '🧪 DRY RUN (no changes will be made)' : '🚀 LIVE UPDATE'}`);
  console.log(`📋 Logging: ${verbose ? '📝 VERBOSE' : '📄 STANDARD'}\n`);

  const { data, error } = await sb
    .from('parts')
    .select('id,slug,name,description,voltage,amperage,phase,category_slug,sku,brand')
    .eq('category_slug','battery-chargers')
    .limit(5000);
  if (error) throw error;
  
  const allParts = data || [];
  console.log(`📊 Found ${allParts.length} total battery chargers`);
  
  const rows = filterGreen(allParts);
  console.log(`🟢 Filtering to ${rows.length} GREEN Series chargers\n`);
  
  const updates: any[] = [];
  const updateLog: UpdateRecord[] = [];
  let skipCount = 0;
  let updateStats = { voltage: 0, amperage: 0, phase: 0 };

  console.log(`🔍 Analyzing GREEN chargers for missing structured specs...\n`);

  for (const r of rows){
    const needV = !r.voltage; 
    const needA = !r.amperage; 
    const needP = !r.phase;
    
    if (!(needV||needA||needP)) {
      skipCount++;
      if (verbose) console.log(`  ✅ ${r.slug} - already complete`);
      continue;
    }
    
    const parsed = parseFromText(r.slug, r.name, r.description||undefined);
    const before = { voltage: r.voltage, amperage: r.amperage, phase: r.phase };
    const after = {
      voltage: r.voltage ?? parsed.voltage ?? null,
      amperage: r.amperage ?? parsed.amperage ?? null,
      phase: r.phase ?? parsed.phase ?? null,
    };
    
    const changes: string[] = [];
    if (needV && after.voltage) { updateStats.voltage++; changes.push(`V: null → ${after.voltage}`); }
    if (needA && after.amperage) { updateStats.amperage++; changes.push(`A: null → ${after.amperage}`); }
    if (needP && after.phase) { updateStats.phase++; changes.push(`P: null → ${after.phase}`); }
    
    if (after.voltage !== before.voltage || after.amperage !== before.amperage || after.phase !== before.phase){
      const updateRecord = {
        id: r.id,
        slug: r.slug,
        name: r.name,
        before,
        after,
        changes
      };
      
      updateLog.push(updateRecord);
      updates.push({ id: r.id, ...after });
      
      const changeStr = changes.join(', ');
      console.log(`  📝 ${r.slug}: ${changeStr}`);
      
      if (verbose) {
        console.log(`      Name: ${r.name}`);
        console.log(`      SKU: ${r.sku || 'N/A'}`);
        console.log(`      Brand: ${r.brand || 'N/A'}`);
        console.log(`      Parsed: V=${parsed.voltage} A=${parsed.amperage} P=${parsed.phase}`);
        console.log('');
      }
    }
  }

  // Export detailed log
  if (updateLog.length > 0) {
    fs.mkdirSync('reports', { recursive: true });
    const logPath = path.join('reports', `backfill_log_${Date.now()}.json`);
    fs.writeFileSync(logPath, JSON.stringify(updateLog, null, 2));
    console.log(`📄 Detailed log saved to: ${logPath}\n`);
  }

  console.log(`📈 Backfill Summary:`);
  console.log(`   Products to update: ${updates.length}`);
  console.log(`   Products already complete: ${skipCount}`);
  console.log(`   Fields being updated: voltage=${updateStats.voltage}, amperage=${updateStats.amperage}, phase=${updateStats.phase}`);
  console.log(`   Completion rate: ${Math.round((skipCount / rows.length) * 100)}%\n`);

  if (updates.length === 0) {
    console.log('✅ No updates needed - all GREEN chargers already have structured specs!');
    return;
  }

  if (isDryRun) {
    console.log('🧪 DRY RUN COMPLETE - No changes were made to the database');
    console.log(`📋 To apply these changes, run: npm run backfill:green --live`);
    return;
  }

  console.log('🚀 Starting batch updates...');
  for (let i=0; i<updates.length; i+=100){  // Smaller batches for safety
    const slice = updates.slice(i, i+100);
    console.log(`   Batch ${Math.floor(i/100) + 1}/${Math.ceil(updates.length/100)}: Updating ${slice.length} records...`);
    
    try {
      const { error: upErr } = await sb.from('parts').upsert(slice, { onConflict: 'id' });
      if (upErr) throw upErr;
      console.log(`   ✅ Batch ${Math.floor(i/100) + 1} complete`);
    } catch (err) {
      console.error(`   ❌ Batch ${Math.floor(i/100) + 1} failed:`, err);
      throw err;
    }
  }
  
  console.log(`\n🎉 Backfill completed successfully!`);
  console.log(`   Total records updated: ${updates.length}`);
  console.log(`   Updated fields: voltage=${updateStats.voltage}, amperage=${updateStats.amperage}, phase=${updateStats.phase}`);
}

main().catch(e=>{ 
  console.error('💥 Backfill failed:', e); 
  process.exit(1); 
});