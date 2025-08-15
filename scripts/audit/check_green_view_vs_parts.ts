/* Sanity: compare counts from green_chargers view vs GREEN filter on parts */
import { createClient } from '@supabase/supabase-js';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)!;
const sb = createClient(url, key, { auth: { persistSession:false } });
(async()=>{
  const vg = await sb.from('green_chargers').select('id', { count:'exact', head:true });
  const vp = await sb.from('parts').select('id', { count:'exact', head:true })
    .eq('category_slug','battery-chargers')
    .ilike('slug','green%');
  console.log({ view_count: vg.count ?? null, parts_green_slug_count: vp.count ?? null });
})();
