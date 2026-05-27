import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { FORKLIFT_COURSE_SLUG } from '@/lib/training/ensure-forklift-enrollment';
import { computeCanTakeExamFromAttempts } from '@/lib/training/quiz-complete-logic';
import {
  userHasExamPurchaseFromRows,
  type ExamPurchaseOrder,
} from '@/lib/training/exam-access-logic';

export type { ExamPurchaseOrder } from '@/lib/training/exam-access-logic';
export { userHasExamPurchaseFromRows } from '@/lib/training/exam-access-logic';

export type ExamStatusPayload = {
  purchased: boolean;
  status: 'not_started' | 'in_progress' | 'passed' | 'failed';
  score: number | null;
  attempts: number;
  certificate_url: string | null;
  certificate_date: string | null;
  can_take_exam: boolean;
  transaction_id: string | null;
};

export async function userHasExamPurchase(
  svc: SupabaseClient,
  userId: string,
): Promise<{ purchased: boolean; transactionId: string | null }> {
  const [{ data: orders }, { count: seatClaimCount }] = await Promise.all([
    svc
      .from('orders')
      .select('id, course_slug, stripe_session_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    svc
      .from('seat_claims')
      .select('order_id', { count: 'exact', head: true })
      .eq('user_id', userId),
  ]);

  const purchased = userHasExamPurchaseFromRows(orders ?? [], seatClaimCount ?? 0, FORKLIFT_COURSE_SLUG);
  const latestOrder = (orders ?? []).find(
    (order) => (order.course_slug ?? FORKLIFT_COURSE_SLUG) === FORKLIFT_COURSE_SLUG,
  );

  return {
    purchased,
    transactionId: latestOrder?.stripe_session_id ?? null,
  };
}

export async function userCanTakeFinalExam(
  svc: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<boolean> {
  if (process.env.EXAM_TEST_BYPASS === '1') return true;

  const [{ data: modules }, { data: quizAttempts }] = await Promise.all([
    svc
      .from('modules')
      .select('id, order')
      .eq('course_id', courseId),
    svc
      .from('quiz_attempts')
      .select('module_id, passed')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false }),
  ]);

  const trainingModuleIds = (modules ?? [])
    .filter((module) => (module.order ?? 0) >= 1 && (module.order ?? 0) <= 5)
    .map((module) => module.id);
  return computeCanTakeExamFromAttempts(trainingModuleIds, quizAttempts ?? []);
}

export async function getExamStatusForUser(
  svc: SupabaseClient,
  userId: string,
): Promise<ExamStatusPayload> {
  const [{ purchased, transactionId }, { data: course }, { data: enrollment }] = await Promise.all([
    userHasExamPurchase(svc, userId),
    svc.from('courses').select('id').eq('slug', FORKLIFT_COURSE_SLUG).maybeSingle(),
    svc
      .from('enrollments')
      .select('id, passed')
      .eq('user_id', userId)
      .eq('course_slug', FORKLIFT_COURSE_SLUG)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const courseId = course?.id;
  const canTakeExam = courseId ? await userCanTakeFinalExam(svc, userId, courseId) : false;

  const [{ data: attempts }, { data: certificate }] = await Promise.all([
    svc
      .from('exam_attempts')
      .select('passed, score_pct, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    svc
      .from('certificates')
      .select('pdf_url, issued_at, verify_code, verification_code, verifier_code')
      .eq('learner_id', userId)
      .order('issued_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const attemptRows = attempts ?? [];
  const latestAttempt = attemptRows[0] ?? null;
  const passedAttempt = attemptRows.find((attempt) => attempt.passed) ?? null;

  let status: ExamStatusPayload['status'] = 'not_started';
  if (passedAttempt || enrollment?.passed || certificate) {
    status = 'passed';
  } else if (latestAttempt) {
    status = latestAttempt.passed ? 'passed' : 'failed';
  }

  const score = passedAttempt?.score_pct ?? latestAttempt?.score_pct ?? null;
  const certificateUrl = certificate?.pdf_url ?? null;
  const certificateDate = certificate?.issued_at ?? null;

  return {
    purchased,
    status,
    score,
    attempts: attemptRows.length,
    certificate_url: certificateUrl,
    certificate_date: certificateDate,
    can_take_exam: canTakeExam,
    transaction_id: transactionId,
  };
}
