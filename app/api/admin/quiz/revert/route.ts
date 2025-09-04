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

  const { question_id, revision_id } = await req.json();
  if (!question_id || !revision_id) return NextResponse.json({ ok: false, error: 'missing_params' }, { status: 400 });

  const { data: rev } = await svc.from('quiz_item_revisions').select('*').eq('id', revision_id).eq('question_id', question_id).maybeSingle();
  if (!rev) return NextResponse.json({ ok: false, error: 'revision_not_found' }, { status: 404 });

  const before = (rev as any).before || {};
  const fields = ['module_slug', 'locale', 'question', 'choices', 'correct_index', 'explain', 'difficulty', 'tags', 'is_exam_candidate', 'active', 'status'];
  const payload: any = { updated_by: user.id };
  for (const f of fields) { if (before.hasOwnProperty(f)) payload[f] = (before as any)[f]; }

  const { data: current } = await svc.from('quiz_items').select('*').eq('id', question_id).maybeSingle();
  const { data: upd, error } = await svc.from('quiz_items').update({ ...payload, version: (current?.version || 0) + 1 }).eq('id', question_id).select('*').maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  await svc.from('quiz_item_revisions').insert({ question_id, editor_user_id: user.id, action: 'revert', version: upd?.version || (current?.version || 0) + 1, before: current || {}, after: upd || {} });
  return NextResponse.json({ ok: true });
}
