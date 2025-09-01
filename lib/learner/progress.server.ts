// lib/learner/progress.server.ts
import 'server-only';
import { supabaseServer } from '@/lib/supabase/server';
import { MODULES } from '@/lib/modules/registry';

export type NextStep = { nextRoute: string; label: string } | null;
export type ModuleProgress = { 
  slug: string; 
  title: string; 
  order: number; 
  quiz_passed: boolean; 
  demo_completed: boolean;
  route: string;
};
export type CourseProgress = { 
  pct: number; 
  stepsLeft: { route: string; label: string }[]; 
  next: NextStep;
  modules: ModuleProgress[];
  allModulesComplete: boolean;
  canTakeExam: boolean;
};

export async function getCourseProgress(courseId: string): Promise<CourseProgress> {
  const sb = supabaseServer();
  const { data: user } = await sb.auth.getUser();
  if (!user?.user) throw new Error('Not authenticated');

  // Get enrollment
  const { data: enroll } = await sb
    .from('enrollments')
    .select('id, progress_pct, resume_state')
    .eq('user_id', user.user.id)
    .eq('course_id', courseId)
    .maybeSingle();

  if (!enroll) {
    return { 
      pct: 0, 
      stepsLeft: [], 
      next: null, 
      modules: [],
      allModulesComplete: false,
      canTakeExam: false
    };
  }

  // Get quiz attempts for this user and course
  const { data: quizAttempts } = await sb
    .from('quiz_attempts')
    .select('module_id, passed, created_at')
    .eq('user_id', user.user.id)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  // Create a map of module quiz completion
  const quizPassMap = new Map<string, boolean>();
  if (quizAttempts) {
    for (const attempt of quizAttempts) {
      if (attempt.module_id && !quizPassMap.has(attempt.module_id)) {
        quizPassMap.set(attempt.module_id, attempt.passed || false);
      }
    }
  }

  // Build module progress using registry
  const moduleProgress: ModuleProgress[] = MODULES.map(module => {
    const route = `/module/${module.order}`;
    return {
      slug: module.slug,
      title: module.title,
      order: module.order,
      quiz_passed: false, // We'll need to map this properly with actual module IDs
      demo_completed: false, // This would need demo completion tracking
      route
    };
  });

  // Calculate steps left (modules not completed)
  const stepsLeft = moduleProgress
    .filter(m => !m.quiz_passed)
    .map(m => ({ route: m.route, label: m.title }));

  const pct = enroll.progress_pct ?? 0;
  const resume = (enroll.resume_state as any)?.next_route as string | undefined;
  const next: NextStep = resume ? { nextRoute: resume, label: 'Resume training' } : (stepsLeft[0] ? { nextRoute: stepsLeft[0].route, label: stepsLeft[0].label } : null);
  
  // Check if all modules are complete
  const allModulesComplete = moduleProgress.every(m => m.quiz_passed);
  
  // Check if exam can be taken (all modules complete or bypass enabled)
  const bypass = process.env.EXAM_TEST_BYPASS === '1';
  const canTakeExam = bypass || allModulesComplete;

  return { 
    pct, 
    stepsLeft, 
    next, 
    modules: moduleProgress,
    allModulesComplete,
    canTakeExam
  };
}
