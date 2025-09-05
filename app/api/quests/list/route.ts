import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const svc = supabaseService();
  const url = new URL(req.url);
  const tag = url.searchParams.get('tag')?.toLowerCase();
  const locale = (url.searchParams.get('locale') === 'es' ? 'es' : 'en');
  
  let q = svc.from('micro_quests').select('*').eq('active', true).eq('locale', locale).order('order_index', { ascending: true });
  if (tag) q = q.eq('tag', tag);
  
  const { data } = await q;
  
  // EN fallback when ES empty
  if ((!data || !data.length) && locale === 'es') {
    const fb = await svc.from('micro_quests').select('*').eq('active', true).eq('locale', 'en').order('order_index', { ascending: true }).eq('tag', tag || '');
    return NextResponse.json({ ok: true, items: fb.data || [], locale: 'en' });
  }
  
  return NextResponse.json({ ok: true, items: data || [], locale });
}
