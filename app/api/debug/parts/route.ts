import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { parseSpecsFromSlugSafe } from '@/lib/specsDebug';

export async function GET() {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from('parts')
    .select('id,slug,name')
    .eq('category_slug','battery-chargers')
    .limit(2000);
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  const rows = (data||[]).map(p => ({ ...p, specs: parseSpecsFromSlugSafe(p.slug) }));
  return NextResponse.json({ ok:true, count: rows.length, rows });
}
