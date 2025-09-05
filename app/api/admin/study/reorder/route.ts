import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

async function isStaff(uid: string) {
  const svc = supabaseService();
  const { data } = await svc.from('profiles').select('role').eq('id', uid).maybeSingle();
  return !!data && ['admin', 'trainer'].includes((data as any).role);
}

export async function POST(req: Request) {
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  if (!user || !(await isStaff(user.id))) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  const { id, dir } = await req.json(); // dir = -1 or 1
  if (!id || ![-1, 1].includes(dir)) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
  const { data: row } = await svc.from('study_cards').select('*').eq('id', id).maybeSingle();
  if (!row) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  const { tag, locale, order_index } = row as any;
  const targetOrder = order_index + dir;
  const { data: swap } = await svc.from('study_cards').select('id,order_index').eq('tag', tag).eq('locale', locale).eq('order_index', targetOrder).maybeSingle();
  await svc.from('study_cards').update({ order_index: targetOrder }).eq('id', id);
  if (swap) { await svc.from('study_cards').update({ order_index }).eq('id', (swap as any).id); }
  return NextResponse.json({ ok: true });
}
