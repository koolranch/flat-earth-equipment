import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export async function POST(req: Request) {
  try {
    const { courseSlug='forklift_operator', locale='en' } = await req.json().catch(() => ({}));
    const sb = supabaseServer();
    const { data: { user }, error: userErr } = await sb.auth.getUser();
    if (userErr || !user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const svc = supabaseService();
    // Get active blueprint (optional, may be used later to weight selection)
    const { data: bp } = await svc.from('exam_blueprints').select('*').eq('course_slug', courseSlug).eq('locale', locale).eq('active', true).limit(1).maybeSingle();
    const count = bp?.count ?? 20;

    // Pick random active questions for course+locale
    const { data: qs, error: qErr } = await svc
      .from('exam_questions')
      .select('*')
      .eq('course_slug', courseSlug)
      .eq('locale', locale)
      .eq('active', true)
      .order('id', { ascending: true })
      .limit(500);
    if (qErr) throw qErr;
    if (!qs || qs.length < count) return NextResponse.json({ error: 'not_enough_questions', have: qs?.length ?? 0, need: count }, { status: 400 });

    // Simple shuffle + take count
    const shuffled = [...qs].sort(() => Math.random() - 0.5).slice(0, count);
    const question_ids = shuffled.map(q => q.id);

    const { data: attempt, error: aErr } = await svc
      .from('exam_attempts')
      .insert({ course_slug: courseSlug, locale, examinee_user_id: user.id, question_ids, status: 'in_progress', started_at: new Date().toISOString() })
      .select('*')
      .single();
    if (aErr) throw aErr;

    return NextResponse.json({ attempt_id: attempt.id }, { status: 201 });
  } catch (err: any) {
    console.error('attempts POST', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
