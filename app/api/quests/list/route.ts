import { supabaseEdgeAnon } from '@/lib/supabase/edgeAnon';

export const runtime = 'edge';
export const preferredRegion = 'iad1';

export async function GET(req: Request) {
  const svc = supabaseEdgeAnon();
  const url = new URL(req.url);
  const tag = url.searchParams.get('tag')?.toLowerCase();
  const locale = (url.searchParams.get('locale') === 'es' ? 'es' : 'en');
  
  let q = svc.from('micro_quests').select('*').eq('active', true).eq('locale', locale).order('order_index', { ascending: true });
  if (tag) q = q.eq('tag', tag);
  
  const { data } = await q;
  
  let items = data || [];
  
  // EN fallback when ES empty
  if (!items.length && locale === 'es') {
    const fb = await svc.from('micro_quests').select('*').eq('active', true).eq('locale', 'en').order('order_index', { ascending: true }).eq('tag', tag || '');
    items = fb.data || [];
    return new Response(JSON.stringify({ ok: true, items, locale: 'en' }), { 
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600'
      } 
    });
  }
  
  return new Response(JSON.stringify({ ok: true, items, locale }), { 
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600'
    } 
  });
}
