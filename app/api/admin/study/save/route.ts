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
  const body = await req.json();
  const { id, tag, locale, kind, title, body: text, media_url, order_index, active } = body;
  if (!tag || !locale || !kind) return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  if (id) {
    const { error } = await svc.from('study_cards').update({ tag: tag.toLowerCase(), locale, kind, title, body: text, media_url, order_index, active }).eq('id', id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id });
  } else {
    const { data: ins, error } = await svc.from('study_cards').insert({ tag: tag.toLowerCase(), locale, kind, title, body: text, media_url, order_index, active: active ?? true }).select('id').maybeSingle();
    if (error || !ins) return NextResponse.json({ ok: false, error: error?.message || 'insert_failed' }, { status: 500 });
    return NextResponse.json({ ok: true, id: (ins as any).id });
  }
}
