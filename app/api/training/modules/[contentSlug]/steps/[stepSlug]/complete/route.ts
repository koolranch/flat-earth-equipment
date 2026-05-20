import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/mobile-auth';
import { resolveCourseForUser } from '@/lib/training/progress-utils';
import {
  applyTrainingStepToEnrollment,
  findEnrollmentForTrainingCourse,
  isTrainingStepKey,
} from '@/lib/training/apply-training-step';
import {
  ensureForkliftEnrollmentWithClient,
  isEnsureEnrollmentOnProgressEnabled,
  isForkliftCourseSlug,
} from '@/lib/training/ensure-forklift-enrollment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function shouldEnsureForkliftEnrollmentOnProgress(courseSlug: string | undefined): boolean {
  return (
    isEnsureEnrollmentOnProgressEnabled(process.env.ENSURE_ENROLLMENT_ON_PROGRESS) &&
    isForkliftCourseSlug(courseSlug)
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: { contentSlug: string; stepSlug: string } },
) {
  const { user, client } = await getAuthUser(req);
  if (!user || !client) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const { contentSlug, stepSlug } = params;
  if (!isTrainingStepKey(stepSlug)) {
    return NextResponse.json({ ok: false, error: 'invalid_step' }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const courseIdOrSlug =
    searchParams.get('courseId') || searchParams.get('courseSlug') || 'forklift';

  const course = await resolveCourseForUser({
    supabase: client,
    userId: user.id,
    courseIdOrSlug,
  });
  if (!course.id) {
    return NextResponse.json({ ok: false, error: 'course_missing' }, { status: 422 });
  }

  if (shouldEnsureForkliftEnrollmentOnProgress(course.slug)) {
    try {
      await ensureForkliftEnrollmentWithClient(client, user.id, course.id);
    } catch (ensureErr: unknown) {
      const message = ensureErr instanceof Error ? ensureErr.message : 'Failed to ensure enrollment';
      console.error('[training/step-complete] ensureForkliftEnrollment failed:', ensureErr);
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
  }

  const enrollment = await findEnrollmentForTrainingCourse(client, user.id, course);
  if (!enrollment) {
    return NextResponse.json({ ok: false, error: 'not_enrolled' }, { status: 404 });
  }

  try {
    const { progress_pct, resume_state } = await applyTrainingStepToEnrollment(
      client,
      enrollment,
      contentSlug,
      stepSlug,
    );
    return NextResponse.json({ ok: true, progress_pct, resume_state });
  } catch (updErr: unknown) {
    const message = updErr instanceof Error ? updErr.message : 'update_failed';
    console.error('[training/step-complete] update failed:', updErr);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
