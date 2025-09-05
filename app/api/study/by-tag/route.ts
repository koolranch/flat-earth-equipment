import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const svc = supabaseService();
  const url = new URL(req.url);
  const tag = (url.searchParams.get('tag') || '').toLowerCase();
  const locale = (url.searchParams.get('locale') === 'es' ? 'es' : 'en');
  if (!tag) return NextResponse.json({ ok: false, error: 'missing_tag' }, { status: 400 });

  const { data: es } = await svc
    .from('study_cards')
    .select('*')
    .eq('tag', tag)
    .eq('locale', locale)
    .eq('active', true)
    .order('order_index', { ascending: true });

  let cards = es || [];
  if (!cards.length && locale === 'es') {
    const { data: en } = await svc
      .from('study_cards')
      .select('*')
      .eq('tag', tag)
      .eq('locale', 'en')
      .eq('active', true)
      .order('order_index', { ascending: true });
    cards = en || [];
  }

  return NextResponse.json({ ok: true, tag, locale, count: cards.length, cards });
}
