// lib/admin/roster.server.ts
import 'server-only';
import { supabaseServer } from '@/lib/supabase/server';

export type RosterItem = {
  enrollment_id: string; user_id: string; learner_email: string | null; course_id: string; progress_pct: number | null; passed: boolean | null;
  certificate?: { id: string; pdf_url: string | null; verifier_code: string | null; score: number | null; issue_date: string | null } | null;
  evaluation?: { practical_pass: boolean | null; evaluation_date: string | null } | null;
};

export async function fetchRoster(orgId: string): Promise<RosterItem[]> {
  const sb = supabaseServer();
  // 1) get enrollments in org
  const { data: enrs, error: e1 } = await sb
    .from('enrollments')
    .select('id,user_id,course_id,progress_pct,passed,org_id,learner_email')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });
  if (e1) throw e1;
  if (!enrs?.length) return [];

  const enrollmentIds = enrs.map(e=>e.id);
  const userIds = enrs.map(e=>e.user_id);
  const courseIds = enrs.map(e=>e.course_id);

  // 2) pull certificates by (user_id, course_id) combo
  const { data: certs } = await sb
    .from('certificates')
    .select('id, learner_id, course_id, pdf_url, verifier_code, score, issue_date')
    .in('learner_id', userIds)
    .in('course_id', courseIds);

  // 3) evaluations by enrollment
  const { data: evals } = await sb
    .from('employer_evaluations')
    .select('enrollment_id, practical_pass, evaluation_date')
    .in('enrollment_id', enrollmentIds);

  const byUserCourse = new Map<string, any>();
  certs?.forEach(c => byUserCourse.set(`${c.learner_id}|${c.course_id}`, c));
  const byEnroll = new Map<string, any>();
  evals?.forEach(ev => byEnroll.set(ev.enrollment_id, ev));

  return enrs.map(e => ({
    enrollment_id: e.id, user_id: e.user_id, learner_email: e.learner_email ?? null, course_id: e.course_id,
    progress_pct: e.progress_pct, passed: e.passed,
    certificate: byUserCourse.get(`${e.user_id}|${e.course_id}`) || null,
    evaluation: byEnroll.get(e.id) || null
  }));
}
