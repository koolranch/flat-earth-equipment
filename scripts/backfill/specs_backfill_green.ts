/* Backfill structured specs for GREEN chargers only. Non-chargers remain NULL. */
import { createClient } from '@supabase/supabase-js';
import { filterGreen } from '../../lib/greenFilter';
import { parseFromText } from '../../lib/specsStruct';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)!;
const sb = createClient(url, key, { auth: { persistSession: false } });

async function main(){
  console.log('🔄 Starting GREEN Series specs backfill...\n');
  
  // Fetch all battery chargers
  const { data, error } = await sb
    .from('parts')
    .select('id,slug,name,description,voltage,amperage,phase,category_slug')
    .eq('category_slug','battery-chargers')
    .limit(5000);
    
  if (error) {
    console.error('❌ Error fetching parts:', error);
    throw error;
  }
  
  const all = data || [];
  console.log(`📊 Found ${all.length} total battery chargers`);
  
  // Filter to GREEN Series only
  const rows = filterGreen(all);
  console.log(`🟢 Filtering to ${rows.length} GREEN Series chargers\n`);
  
  const updates: any[] = [];
  let skippedCount = 0;
  let updatedFields = { voltage: 0, amperage: 0, phase: 0 };

  for (const r of rows){
    const needV = !r.voltage; 
    const needA = !r.amperage; 
    const needP = !r.phase;
    
    if (!(needV || needA || needP)) {
      skippedCount++;
      continue;
    }
    
    // Parse missing fields from text
    const parsed = parseFromText(r.slug, r.name, r.description || undefined);
    
    const next = {
      id: r.id,
      voltage: r.voltage ?? parsed.voltage ?? null,
      amperage: r.amperage ?? parsed.amperage ?? null,
      phase: r.phase ?? parsed.phase ?? null,
    };
    
    // Track what we're updating
    if (needV && next.voltage) updatedFields.voltage++;
    if (needA && next.amperage) updatedFields.amperage++;
    if (needP && next.phase) updatedFields.phase++;
    
    // Only push if at least one field changes
    if (next.voltage !== r.voltage || next.amperage !== r.amperage || next.phase !== r.phase){
      updates.push(next);
    }
  }

  console.log('📈 Backfill Analysis:');
  console.log(`   Products needing updates: ${updates.length}`);
  console.log(`   Products already complete: ${skippedCount}`);
  console.log(`   Fields to update: voltage=${updatedFields.voltage}, amperage=${updatedFields.amperage}, phase=${updatedFields.phase}\n`);

  if (updates.length === 0) {
    console.log('✅ No updates needed - all GREEN Series chargers already have structured specs!');
    return;
  }

  console.log('🚀 Starting batch updates...');
  
  // Process in batches of 500
  for (let i = 0; i < updates.length; i += 500){
    const slice = updates.slice(i, i + 500);
    console.log(`   Batch ${Math.floor(i/500) + 1}: Updating ${slice.length} records...`);
    
    const { error: upErr } = await sb
      .from('parts')
      .upsert(slice, { onConflict: 'id' });
      
    if (upErr) {
      console.error('❌ Batch update error:', upErr);
      throw upErr;
    }
    
    console.log(`   ✅ Batch complete`);
  }
  
  console.log(`\n🎉 Backfill completed successfully!`);
  console.log(`   Total records updated: ${updates.length}`);
  console.log(`   Run the verification script to check results.`);
}

main().catch(e => { 
  console.error('💥 Backfill failed:', e); 
  process.exit(1); 
});
