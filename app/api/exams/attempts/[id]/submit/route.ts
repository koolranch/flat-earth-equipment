import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { grade, PASSING_FRACTION } from '@/lib/exam';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { answers } = await req.json();
    if (!Array.isArray(answers)) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

    const sb = supabaseServer();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const svc = supabaseService();
    const { data: attempt, error: aErr } = await svc.from('exam_attempts').select('*').eq('id', params.id).single();
    if (aErr || !attempt) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if (attempt.examinee_user_id !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const { data: qs, error: qErr } = await svc.from('exam_questions').select('*').in('id', attempt.question_ids);
    if (qErr) throw qErr;

    const result = grade(qs as any, answers);

    const { data: updated, error: uErr } = await svc
      .from('exam_attempts')
      .update({
        status: result.passed ? 'passed' : 'failed',
        finished_at: new Date().toISOString(),
        score: result.score,
        correct_count: result.correct,
        total_count: result.total,
        submitted_answers: answers
      })
      .eq('id', params.id)
      .select('*')
      .single();
    if (uErr) throw uErr;

    // Best-effort: trigger certificate issuing if passed
    if (result.passed) {
      // Try a soft call; ignore failures so submit stays successful
      try { await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/certificates/issue`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, course_slug: attempt.course_slug || 'forklift_operator', exam_attempt_id: attempt.id, passing_score: PASSING_FRACTION }) }); } catch {}
    }

    return NextResponse.json({ result, attempt: { id: updated.id, status: updated.status, score: updated.score } });
  } catch (err) {
    console.error('attempt submit', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
