import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }:{ params:{ slug:string } }){
  const svc = supabaseService();
  const { searchParams } = new URL(req.url);
  const locale = (searchParams.get('locale') || process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en') as 'en'|'es';
  const order: ('en'|'es')[] = locale==='es' ? ['es','en'] : ['en','es'];

  for (const loc of order){
    const { data, error } = await svc
      .from('quiz_items')
      .select('id,module_slug,locale,question,choices,correct_index,explain,difficulty,tags,is_exam_candidate,active')
      .eq('module_slug', params.slug)
      .eq('locale', loc)
      .eq('active', true)
      .order('difficulty', { ascending: true, nullsFirst: true });
    if (error) return NextResponse.json({ ok:false, error: error.message }, { status:500 });
    if (data && data.length) return NextResponse.json({ ok:true, locale: loc, items: data }, { headers:{ 'Cache-Control':'no-store' } });
  }

  return NextResponse.json({ ok:true, locale:'en', items: [] }, { headers:{ 'Cache-Control':'no-store' } });
}
