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
  const { id, module_slug, locale, question, choices, correct_index, explain, difficulty, tags, is_exam_candidate, active, status } = body;
  if (!module_slug || !locale || !question || !Array.isArray(choices) || typeof correct_index !== 'number') {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }

  if (id) {
    // fetch current for audit
    const { data: current } = await svc.from('quiz_items').select('*').eq('id', id).maybeSingle();
    const { data: upd, error } = await svc.from('quiz_items').update({ module_slug, locale, question, choices, correct_index, explain, difficulty, tags, is_exam_candidate, active, status, updated_by: user.id, version: (current?.version || 0) + 1 }).eq('id', id).select('*').maybeSingle();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await svc.from('quiz_item_revisions').insert({ question_id: id, editor_user_id: user.id, action: 'update', version: upd?.version || (current?.version || 0) + 1, before: current || {}, after: upd || {} });
    return NextResponse.json({ ok: true, id });
  } else {
    const { data: ins, error } = await svc.from('quiz_items').insert({ module_slug, locale, question, choices, correct_index, explain, difficulty, tags, is_exam_candidate, active: active ?? true, status: status ?? 'draft', updated_by: user.id, version: 1 }).select('id,version').maybeSingle();
    if (error || !ins) return NextResponse.json({ ok: false, error: error?.message || 'insert_fail' }, { status: 500 });
    await svc.from('quiz_item_revisions').insert({ question_id: ins.id, editor_user_id: user.id, action: 'create', version: ins.version, before: {}, after: body });
    return NextResponse.json({ ok: true, id: ins.id });
  }
}
