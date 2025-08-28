// lib/learner/progress.server.ts
import 'server-only';
import { supabaseServer } from '@/lib/supabase/server';

export type NextStep = { nextRoute: string; label: string } | null;
export type CourseProgress = { pct: number; stepsLeft: { route: string; label: string }[]; next: NextStep };

export async function getCourseProgress(courseId: string): Promise<CourseProgress> {
  const sb = supabaseServer();
  const { data: user } = await sb.auth.getUser();
  if (!user?.user) throw new Error('Not authenticated');

  // naive example: infer from completed modules/quizzes/demos
  const { data: modules } = await sb.from('modules').select('id, title, slug').eq('course_id', courseId).order('order');
  const { data: enroll } = await sb.from('enrollments').select('id, progress_pct, resume_state').eq('user_id', user.user.id).eq('course_id', courseId).maybeSingle();

  const stepsLeft = (modules||[]).map(m => ({ route: `/module/${m.slug}`, label: m.title }));
  const pct = enroll?.progress_pct ?? 0;
  const resume = (enroll?.resume_state as any)?.next_route as string | undefined;
  const next: NextStep = resume ? { nextRoute: resume, label: 'Resume training' } : (stepsLeft[0] ? { nextRoute: stepsLeft[0].route, label: stepsLeft[0].label } : null);
  return { pct, stepsLeft, next };
}
