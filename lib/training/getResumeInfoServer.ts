import { createServerClient } from '@/lib/supabase/server';

export type ResumeInfo = {
  resumePath: string;           // where the Resume CTA should send the learner
  unlockedUptoIndex: number;    // 0-based index of the next module to do (earlier modules always unlocked)
  modules: { id: string; title: string; order: number }[];
};

/** Server-only util. Figures out where the learner should go next and which modules are unlocked. */
export async function getResumeInfoServer(courseSlug: string = 'forklift'): Promise<ResumeInfo> {
  const supabase = createServerClient();
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) {
    // unauthenticated callers shouldn't reach here; default to module 1
    return { resumePath: '/training/modules/pre-op', unlockedUptoIndex: 0, modules: [] };
  }

  // 1) Load course and modules
  const { data: course } = await supabase.from('courses').select('id, slug').eq('slug', courseSlug).maybeSingle();
  const courseId = course?.id;

  const { data: mods } = await supabase
    .from('modules')
    .select('id, title, order, content_slug')
    .eq('course_id', courseId || '')
    .order('order', { ascending: true });

  const modules = (mods ?? []).map(m => ({ 
    id: m.id as string, 
    title: m.title as string, 
    order: Number(m.order),
    content_slug: m.content_slug as string
  }));

  // 2) Load enrollment
  let enrollment: any = null;
  if (courseId) {
    const { data } = await supabase
      .from('enrollments')
      .select('id, resume_state')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })
      .limit(1);
    enrollment = data?.[0] || null;
  }
  if (!enrollment) {
    const { data } = await supabase
      .from('enrollments')
      .select('id, resume_state')
      .eq('user_id', userId)
      .eq('course_slug', courseSlug)
      .order('created_at', { ascending: false })
      .limit(1);
    enrollment = data?.[0] || null;
  }

  // 3) Determine next incomplete module from quiz_attempts (passed=true) if available
  let nextIndex = 0;
  if (modules.length) {
    const moduleIds = modules.map(m => m.id);
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('module_id, passed')
      .in('module_id', moduleIds)
      .eq('user_id', userId);

    const passedSet = new Set((attempts ?? []).filter(a => a.passed).map(a => a.module_id));
    const firstIncomplete = modules.findIndex(m => !passedSet.has(m.id));
    nextIndex = firstIncomplete === -1 ? Math.max(0, modules.length - 1) : firstIncomplete;
  }

  // 4) Prefer explicit resume_state if present
  const rs = (enrollment?.resume_state as any) || null;
  let resumeIndex = nextIndex;
  if (rs?.moduleIndex !== undefined && Number.isFinite(rs.moduleIndex)) {
    resumeIndex = Math.min(Math.max(0, rs.moduleIndex), Math.max(0, modules.length - 1));
  }

  // 5) Build resume path
  let resumePath = '/training/modules/pre-op'; // fallback
  if (modules[resumeIndex]?.content_slug) {
    resumePath = `/training/modules/${modules[resumeIndex].content_slug}`;
  } else if (resumeIndex < modules.length) {
    resumePath = `/training/module/${resumeIndex + 1}`;
  }

  return {
    resumePath,
    unlockedUptoIndex: nextIndex,     // all indices <= nextIndex are clickable
    modules: modules.map(m => ({ id: m.id, title: m.title, order: m.order }))
  };
}
