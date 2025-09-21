import { createServerClient } from '@/lib/supabase/server';
import { resolveCourseForUser, getModuleSlugsForCourse, computePercentFractional } from '@/lib/training/progress-utils';

type Gate = 'osha'|'practice'|'cards'|'quiz';

export async function updateProgressForModule(opts: {
  userId: string,
  courseIdOrSlug?: string | null,
  moduleSlug?: string | null,
  moduleId?: string | null,
  gate?: Gate | null,
  complete?: boolean
}) {
  const supabase = createServerClient();
  const { userId, courseIdOrSlug, moduleSlug: inSlug, moduleId, gate, complete } = opts;

  // 1) Resolve course
  const course = await resolveCourseForUser({ supabase, userId, courseIdOrSlug: courseIdOrSlug ?? undefined });
  if (!course.id) return { ok: false, error: 'course_missing' as const, status: 422 };

  // 2) Resolve moduleSlug if only id provided
  let moduleSlug = inSlug?.trim() || '';
  if (!moduleSlug && moduleId) {
    const { data: m } = await supabase
      .from('modules')
      .select('content_slug')
      .eq('id', moduleId)
      .maybeSingle();
    moduleSlug = (m?.content_slug || '').trim();
  }
  if (!moduleSlug) return { ok: false, error: 'missing_moduleSlug', status: 400 } as const;

  // 3) Find enrollment by course id, then slug
  let enrollment: any = null;
  {
    const { data } = await supabase
      .from('enrollments')
      .select('id, resume_state, progress_pct')
      .eq('user_id', userId)
      .eq('course_id', course.id)
      .order('created_at', { ascending: false })
      .limit(1);
    enrollment = data?.[0] || null;
  }
  if (!enrollment && course.slug) {
    const { data } = await supabase
      .from('enrollments')
      .select('id, resume_state, progress_pct')
      .eq('user_id', userId)
      .eq('course_slug', course.slug)
      .order('created_at', { ascending: false })
      .limit(1);
    enrollment = data?.[0] || null;
  }
  if (!enrollment) return { ok: false, error: 'not_enrolled', status: 404 } as const;

  // 4) Merge resume_state
  const state = (enrollment.resume_state || {}) as Record<string, Partial<Record<Gate, boolean>>>;
  const current = { ...(state[moduleSlug] || {}) } as Record<Gate, boolean>;
  if (complete) {
    current.osha = true; current.practice = true; current.cards = true; current.quiz = true;
  } else if (gate) {
    current[gate] = true;
  } else {
    return { ok: false, error: 'missing_gate_or_complete', status: 400 } as const;
  }
  state[moduleSlug] = current;

  // 5) Recompute fractional percent across this course
  const moduleSlugs = await getModuleSlugsForCourse(course.id, supabase);
  const pct = computePercentFractional(state as any, moduleSlugs);

  const { error: updErr } = await supabase
    .from('enrollments')
    .update({ resume_state: state, progress_pct: pct, updated_at: new Date().toISOString() })
    .eq('id', enrollment.id);
  if (updErr) return { ok: false, error: 'update_failed', status: 500 } as const;

  return { ok: true as const, progress_pct: pct, resume_state: state };
}

export function extractLegacyProgressPayload(body: any) {
  // Normalize various legacy shapes
  // Module slug candidates
  const slug = body?.moduleSlug || body?.slug || body?.module_slug || body?.content_slug || body?.module?.slug || '';
  const moduleId = body?.moduleId || body?.module_id || (typeof body?.id === 'string' ? body.id : undefined);

  // Course candidates
  const courseIdOrSlug = body?.courseId || body?.course_id || body?.courseSlug || body?.course_slug || body?.course?.slug || undefined;

  // Gate/complete
  let complete = !!(body?.complete || body?.completed || (typeof body?.status === 'string' && body.status.toLowerCase() === 'complete'));
  let gate = body?.gate || body?.step || undefined;
  if (!gate && typeof body?.action === 'string') {
    const a = body.action.toLowerCase();
    if (a.includes('complete')) complete = true;
    else if (a.includes('osha')) gate = 'osha';
    else if (a.includes('practice')) gate = 'practice';
    else if (a.includes('card')) gate = 'cards';
    else if (a.includes('quiz')) gate = 'quiz';
  }
  // Whitelist gate values
  if (gate && !['osha','practice','cards','quiz'].includes(String(gate))) {
    gate = undefined;
  }

  return {
    moduleSlug: typeof slug === 'string' ? slug : undefined,
    moduleId: typeof moduleId === 'string' ? moduleId : undefined,
    courseIdOrSlug: typeof courseIdOrSlug === 'string' ? courseIdOrSlug : undefined,
    gate: gate as 'osha'|'practice'|'cards'|'quiz'|undefined,
    complete
  } as const;
}
