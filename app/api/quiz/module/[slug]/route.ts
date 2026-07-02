import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { applyEsTranslations } from '@/lib/quiz/module-quiz-es';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }:{ params:{ slug:string } }){
  const svc = supabaseService();
  const { searchParams } = new URL(req.url);

  // lang=es: serve the SAME English rows (same ids/order/count/correct_index)
  // with Spanish text overlaid from a static in-repo map. Any other value of
  // `lang` (or absence) falls through to the pre-existing locale behavior,
  // which is unchanged.
  if (searchParams.get('lang') === 'es') {
    const { data, error } = await svc
      .from('quiz_items')
      .select('id,module_slug,locale,question,choices,correct_index,explain,difficulty,tags,is_exam_candidate,active')
      .eq('module_slug', params.slug)
      .eq('locale', 'en')
      .eq('active', true)
      .order('difficulty', { ascending: true, nullsFirst: true });
    if (error) return NextResponse.json({ ok:false, error: error.message }, { status:500 });
    const items = applyEsTranslations(data ?? []);
    return NextResponse.json({ ok:true, locale:'es', items }, { headers:{ 'Cache-Control':'no-store' } });
  }

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
