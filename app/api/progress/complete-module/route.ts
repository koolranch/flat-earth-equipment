import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { resolveCourseForUser, getModuleSlugsForCourse, computePercentFractional } from '@/lib/training/progress-utils';

type Gate = 'osha' | 'practice' | 'cards' | 'quiz';

export async function POST(req: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({} as any));
  // Legacy payloads we support:
  // { moduleSlug, gate }
  // { moduleSlug, complete: true }
  // { moduleId, gate }  or  { moduleId, complete: true }
  // Optional: { courseId } or { courseSlug }
  const moduleSlugInput: string | undefined = body.moduleSlug;
  const moduleId: string | undefined = body.moduleId;
  const gate: Gate | undefined = body.gate;
  const complete: boolean = !!body.complete;
  const courseIdOrSlug: string | undefined = body.courseId || body.courseSlug || undefined;

  // Resolve course (uuid or slug, or most recent enrollment fallback)
  const course = await resolveCourseForUser({ supabase, userId: user.id, courseIdOrSlug });
  if (!course.id) return NextResponse.json({ ok: false, error: 'course_missing' }, { status: 422 });

  // Resolve moduleSlug if only moduleId was provided
  let moduleSlug = moduleSlugInput as string | undefined;
  if (!moduleSlug && moduleId) {
    const { data: m } = await supabase
      .from('modules')
      .select('content_slug')
      .eq('id', moduleId)
      .maybeSingle();
    moduleSlug = (m?.content_slug || undefined) as string | undefined;
  }
  if (!moduleSlug) return NextResponse.json({ ok: false, error: 'missing_moduleSlug' }, { status: 400 });

  // Find enrollment by course_id or course_slug
  let enrollment: any = null;
  {
    const { data: enrById } = await supabase
      .from('enrollments')
      .select('id, resume_state, progress_pct')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .order('created_at', { ascending: false })
      .limit(1);
    enrollment = enrById?.[0] || null;
  }
  if (!enrollment && course.slug) {
    const { data: enrBySlug } = await supabase
      .from('enrollments')
      .select('id, resume_state, progress_pct')
      .eq('user_id', user.id)
      .eq('course_slug', course.slug)
      .order('created_at', { ascending: false })
      .limit(1);
    enrollment = enrBySlug?.[0] || null;
  }
  if (!enrollment) return NextResponse.json({ ok: false, error: 'not_enrolled' }, { status: 404 });

  // Merge resume_state for the requested module
  const state = (enrollment.resume_state || {}) as Record<string, Partial<Record<Gate, boolean>>>;
  const current = { ...(state[moduleSlug] || {}) } as Record<Gate, boolean>;

  if (complete) {
    current.osha = true;
    current.practice = true;
    current.cards = true;
    current.quiz = true;
  } else if (gate) {
    current[gate] = true;
  } else {
    // No gate and not complete → keep backward compatible but do nothing destructive
    return NextResponse.json({ ok: false, error: 'missing_gate_or_complete' }, { status: 400 });
  }

  state[moduleSlug] = current;

  // Recompute progress fractionally across this course
  const moduleSlugs = await getModuleSlugsForCourse(course.id, supabase);
  const pct = computePercentFractional(state as any, moduleSlugs);

  const { error: updErr } = await supabase
    .from('enrollments')
    .update({ resume_state: state, progress_pct: pct, updated_at: new Date().toISOString() })
    .eq('id', enrollment.id);
  if (updErr) return NextResponse.json({ ok: false, error: 'update_failed' }, { status: 500 });

  return NextResponse.json({ ok: true, progress_pct: pct, resume_state: state });
}
