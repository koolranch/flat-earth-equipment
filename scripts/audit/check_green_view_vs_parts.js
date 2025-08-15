/* Sanity: compare counts from green_chargers view vs GREEN filter on parts (JavaScript version) */
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

(async () => {
  try {
    console.log('🔍 Comparing GREEN view vs parts table counts...\n');

    // Count from green_chargers view
    console.log('📊 Querying green_chargers view...');
    const vg = await sb.from('green_chargers').select('id', { count: 'exact', head: true });
    
    if (vg.error) {
      console.log(`❌ GREEN view error: ${vg.error.message}`);
      console.log('📝 This means the view hasn\'t been created yet');
    } else {
      console.log(`✅ GREEN view count: ${vg.count}`);
    }

    // Count from parts table with GREEN filter
    console.log('📊 Querying parts table with GREEN filter...');
    const vp = await sb.from('parts').select('id', { count: 'exact', head: true })
      .eq('category_slug', 'battery-chargers')
      .ilike('slug', 'green%');
    
    if (vp.error) {
      console.log(`❌ Parts query error: ${vp.error.message}`);
    } else {
      console.log(`✅ Parts GREEN slug count: ${vp.count}`);
    }

    // Count from parts with structured fields
    console.log('📊 Querying parts table with structured fields filter...');
    const vps = await sb.from('parts').select('id', { count: 'exact', head: true })
      .eq('category_slug', 'battery-chargers')
      .ilike('slug', 'green%')
      .not('voltage', 'is', null)
      .not('amperage', 'is', null)
      .not('phase', 'is', null);
    
    if (vps.error) {
      console.log(`❌ Parts structured query error: ${vps.error.message}`);
    } else {
      console.log(`✅ Parts GREEN with structured specs: ${vps.count}`);
    }

    console.log('\n📋 Summary:');
    console.log(JSON.stringify({ 
      view_count: vg.count ?? null,
      parts_green_slug_count: vp.count ?? null,
      parts_green_structured_count: vps.count ?? null,
      view_error: vg.error ? vg.error.message : null
    }, null, 2));

    // Analysis
    if (vg.error) {
      console.log('\n⚠️  Analysis: GREEN view not created yet');
      console.log('📝 Run sql/create_green_view.sql in Supabase dashboard');
    } else if (vg.count === vps.count) {
      console.log('\n✅ Analysis: Perfect! View count matches structured parts count');
    } else if (vg.count < vp.count) {
      console.log('\n📊 Analysis: View count is less than total GREEN parts (expected - view enforces structured specs)');
      console.log(`📝 Missing structured specs: ${(vp.count || 0) - (vg.count || 0)}`);
    } else {
      console.log('\n⚠️  Analysis: Unexpected count difference');
    }

  } catch (e) {
    console.error('💥 Comparison failed:', e);
    process.exit(1);
  }
})();
