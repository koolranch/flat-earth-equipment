import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { sanitizeQuestion } from '@/lib/exam';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const sb = supabaseServer();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const svc = supabaseService();

    const { data: attempt, error: aErr } = await svc.from('exam_attempts').select('*').eq('id', params.id).single();
    if (aErr || !attempt) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if (attempt.examinee_user_id !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const { data: qs, error: qErr } = await svc.from('exam_questions').select('*').in('id', attempt.question_ids);
    if (qErr) throw qErr;

    // Preserve original order
    const byId = new Map(qs.map(q => [q.id, q]));
    const ordered = attempt.question_ids.map((id: string) => byId.get(id)).filter(Boolean);

    return NextResponse.json({ attempt: { id: attempt.id, status: attempt.status, started_at: attempt.started_at, course_slug: attempt.course_slug }, questions: ordered.map(sanitizeQuestion) });
  } catch (err) {
    console.error('attempt GET', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
