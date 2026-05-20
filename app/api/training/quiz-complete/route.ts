import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/mobile-auth';
import {
  computeQuizBasedProgressPct,
  resolveModuleByIdOrOrder,
} from '@/lib/training/quiz-complete-logic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Record a passed (or failed) module quiz for web (cookie) and mobile (Bearer).
 *
 * Mobile contract:
 *   POST /api/training/quiz-complete?courseId=forklift
 *   Authorization: Bearer <supabase_jwt>
 *   Body: { "moduleId": 1, "score": 100, "passed": true }
 *
 * moduleId = module `order` (1–5), same as web SimpleQuizModal — e.g. 1 = pre-operation-inspection.
 */
export async function POST(req: NextRequest) {
  try {
    const { user, client } = await getAuthUser(req);
    if (!user || !client) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { moduleId, score, passed } = await req.json();

    if (moduleId === undefined || moduleId === null || moduleId === '') {
      return NextResponse.json({ error: 'Missing moduleId' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const courseSlug =
      searchParams.get('courseId') || searchParams.get('courseSlug') || 'forklift';

    console.log('[quiz-complete] Processing quiz completion:', {
      moduleId,
      score,
      passed,
      courseSlug,
      userId: user.id,
    });

    const { data: course, error: courseError } = await client
      .from('courses')
      .select('id, slug')
      .eq('slug', courseSlug)
      .single();

    if (courseError || !course) {
      console.error('[quiz-complete] Course not found:', courseSlug, courseError?.message);
      return NextResponse.json(
        { error: 'Course not found', details: courseError?.message },
        { status: 404 },
      );
    }

    const { data: allModules, error: modulesError } = await client
      .from('modules')
      .select('id, course_id, title, order, type')
      .eq('course_id', course.id);

    if (modulesError) {
      console.error('[quiz-complete] Error loading modules:', modulesError);
      return NextResponse.json(
        { error: 'Error loading modules', details: modulesError.message },
        { status: 500 },
      );
    }

    const moduleData = resolveModuleByIdOrOrder(allModules ?? [], moduleId);

    if (!moduleData) {
      console.error('[quiz-complete] Module not found. Searched for:', moduleId);
      console.error(
        '[quiz-complete] Available modules:',
        allModules?.map((m) => ({ order: m.order, title: m.title })),
      );

      return NextResponse.json({
        error: 'Module not found',
        searched: moduleId,
        available: allModules?.map((m) => m.order),
      }, { status: 404 });
    }

    console.log('[quiz-complete] Found module:', {
      id: moduleData.id,
      title: moduleData.title,
      order: moduleData.order,
    });

    const { error: insertError } = await client.from('quiz_attempts').insert({
      user_id: user.id,
      course_id: moduleData.course_id,
      module_id: moduleData.id,
      mode: 'full',
      seed: `quiz-${Date.now()}`,
      question_ids: [],
      incorrect_ids: [],
      correct_count: passed ? 1 : 0,
      total_count: 1,
      score: score ?? 0,
      passed: passed ?? false,
    });

    if (insertError) {
      console.error('[quiz-complete] Error creating quiz attempt:', insertError);
      return NextResponse.json({ error: 'Failed to save quiz attempt' }, { status: 500 });
    }

    const { data: enrollment } = await client
      .from('enrollments')
      .select('id, course_id, progress_pct')
      .eq('user_id', user.id)
      .eq('course_id', moduleData.course_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (enrollment) {
      const { data: trainingModules } = await client
        .from('modules')
        .select('id')
        .eq('course_id', moduleData.course_id)
        .gte('order', 1)
        .lte('order', 5);

      const { data: completedAttempts } = await client
        .from('quiz_attempts')
        .select('module_id')
        .eq('user_id', user.id)
        .eq('course_id', moduleData.course_id)
        .eq('passed', true);

      if (trainingModules && completedAttempts) {
        const totalModules = trainingModules.length;
        const completedCount = new Set(completedAttempts.map((a) => a.module_id)).size;
        const newProgress = computeQuizBasedProgressPct(
          totalModules,
          completedCount,
          enrollment.progress_pct,
        );

        console.log('[quiz-complete] Updating progress:', {
          completed: completedCount,
          total: totalModules,
          newProgress,
          previous: enrollment.progress_pct,
        });

        await client
          .from('enrollments')
          .update({
            progress_pct: newProgress,
            updated_at: new Date().toISOString(),
          })
          .eq('id', enrollment.id);
      }
    }

    console.log('[quiz-complete] Quiz completion saved successfully');
    return NextResponse.json({ ok: true, passed: passed ?? false });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error';
    console.error('[quiz-complete] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
