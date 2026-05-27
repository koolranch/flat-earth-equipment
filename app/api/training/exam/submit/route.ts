/**
 * POST /api/training/exam/submit
 *
 * Mobile final exam submit path. Grades the fixed mobile question bank,
 * writes exam_attempts, updates enrollment, and triggers certificate issue.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/mobile-auth';
import { supabaseService } from '@/lib/supabase/service.server';
import {
  userCanTakeFinalExam,
  userHasExamPurchase,
} from '@/lib/training/exam-access.server';
import { FORKLIFT_COURSE_SLUG } from '@/lib/training/ensure-forklift-enrollment';
import {
  gradeMobileExamAnswers,
  type MobileExamAnswer,
} from '@/lib/training/mobile-exam-bank';

type SubmitBody = {
  examId?: string;
  answers?: MobileExamAnswer[];
};

export async function POST(req: NextRequest) {
  const { user } = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: SubmitBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const answers = Array.isArray(body.answers) ? body.answers : [];
  if (!answers.length) {
    return NextResponse.json({ error: 'answers required' }, { status: 400 });
  }

  const svc = supabaseService();

  const [{ purchased }, { data: course }] = await Promise.all([
    userHasExamPurchase(svc, user.id),
    svc.from('courses').select('id').eq('slug', FORKLIFT_COURSE_SLUG).maybeSingle(),
  ]);

  if (!purchased) {
    return NextResponse.json({ error: 'exam_not_purchased' }, { status: 403 });
  }

  if (!course?.id) {
    return NextResponse.json({ error: 'course_not_found' }, { status: 404 });
  }

  const canTakeExam = await userCanTakeFinalExam(svc, user.id, course.id);
  if (!canTakeExam) {
    return NextResponse.json({ error: 'training_incomplete' }, { status: 403 });
  }

  const grade = gradeMobileExamAnswers(answers);
  const answerPayload = Object.fromEntries(
    answers.map((answer) => [answer.questionId, answer.optionId]),
  );

  const { data: attemptRow, error: attemptError } = await svc
    .from('exam_attempts')
    .insert({
      user_id: user.id,
      exam_slug: 'final-exam',
      selected_ids: answers.map((answer) => answer.questionId),
      answers: answerPayload,
      score_pct: grade.score,
      passed: grade.passed,
      items_total: grade.totalCount,
      items_correct: grade.correctCount,
    })
    .select('id')
    .maybeSingle();

  if (attemptError) {
    console.error('[training/exam/submit] exam_attempt insert failed:', attemptError);
    return NextResponse.json({ error: 'attempt_insert_failed' }, { status: 500 });
  }

  let certificateUrl: string | null = null;

  if (grade.passed) {
    const { data: enrollment } = await svc
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (enrollment?.id) {
      await svc
        .from('enrollments')
        .update({
          passed: true,
          progress_pct: 100,
          updated_at: new Date().toISOString(),
        })
        .eq('id', enrollment.id);

      try {
        const certApiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.flatearthequipment.com'}/api/cert/issue`;
        const certResponse = await fetch(certApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enrollment_id: enrollment.id }),
        });

        if (certResponse.ok) {
          const certData = await certResponse.json();
          certificateUrl = certData.pdf_url ?? certData.certificate_url ?? null;
        } else {
          const certError = await certResponse.text();
          console.error('[training/exam/submit] certificate issue failed:', certResponse.status, certError);
        }
      } catch (certError) {
        console.error('[training/exam/submit] certificate issue error:', certError);
      }
    } else {
      console.error('[training/exam/submit] no enrollment found for passed exam user:', user.id);
    }
  }

  return NextResponse.json({
    score: grade.score,
    passed: grade.passed,
    correctCount: grade.correctCount,
    totalCount: grade.totalCount,
    questionResults: grade.questionResults,
    certificateUrl,
    attempt_id: attemptRow?.id ?? null,
  });
}
