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
  const { id } = await req.json();
  if (!id) return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 });

  const { data: current } = await svc.from('quiz_items').select('*').eq('id', id).maybeSingle();
  const { data: upd, error } = await svc.from('quiz_items').update({ status: 'published', version: (current?.version || 0) + 1, updated_by: user.id }).eq('id', id).select('*').maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  await svc.from('quiz_item_revisions').insert({ question_id: id, editor_user_id: user.id, action: 'publish', version: upd?.version || (current?.version || 0) + 1, before: current || {}, after: upd || {} });
  return NextResponse.json({ ok: true });
}
