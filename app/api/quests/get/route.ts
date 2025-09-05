import { supabaseEdgeAnon } from '@/lib/supabase/edgeAnon';

export const runtime = 'edge';
export const preferredRegion = 'iad1';

export async function GET(req: Request) {
  const svc = supabaseEdgeAnon();
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug');
  
  if (!slug) return new Response(JSON.stringify({ ok: false, error: 'missing_slug' }), { 
    status: 400, 
    headers: { 'Content-Type': 'application/json' } 
  });
  
  const { data } = await svc.from('micro_quests').select('*').eq('slug', slug).maybeSingle();
  
  if (!data) return new Response(JSON.stringify({ ok: false, error: 'not_found' }), { 
    status: 404, 
    headers: { 'Content-Type': 'application/json' } 
  });
  
  return new Response(JSON.stringify({ ok: true, quest: data }), { 
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600'
    } 
  });
}
