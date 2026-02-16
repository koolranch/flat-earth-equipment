import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/mobile-auth';
import { computePercentFractional, resolveCourseForUser, getModuleSlugsForCourse } from '@/lib/training/progress-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseParam = searchParams.get('courseId') || searchParams.get('courseSlug') || 'forklift';
    
    console.log('[training/progress] Request for courseParam:', courseParam);

    // Authenticate via cookie (web) or Bearer token (mobile)
    const { user, client } = await getAuthUser(req);
    if (!user || !client) {
      console.log('[training/progress] No valid user session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[training/progress] Auth result:', { userId: user.id, email: user.email });

    // Use the new resolver to avoid UUID casting errors
    const course = await resolveCourseForUser({ 
      supabase: client, 
      userId: user.id, 
      courseIdOrSlug: courseParam 
    });
    if (!course.id) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Get enrollment by course_id or course_slug
    let enrollment: any = null;
    {
      const { data: enrById } = await client
        .from('enrollments')
        .select('id, progress_pct, passed, resume_state')
        .eq('user_id', user.id)
        .eq('course_id', course.id)
        .order('created_at', { ascending: false })
        .limit(1);
      enrollment = enrById?.[0] || null;
    }
    if (!enrollment && course.slug) {
      const { data: enrBySlug } = await client
        .from('enrollments')
        .select('id, progress_pct, passed, resume_state')
        .eq('user_id', user.id)
        .eq('course_slug', course.slug)
        .order('created_at', { ascending: false })
        .limit(1);
      enrollment = enrBySlug?.[0] || null;
    }

    console.log('[training/progress] Enrollment lookup:', enrollment ? `found ${enrollment.id}` : 'none');

    if (!enrollment) {
      console.log('[training/progress] No enrollment found for user:', user.id, 'course:', course.id);
      return NextResponse.json({ error: 'No enrollment found' }, { status: 404 });
    }

    // Get modules for this course
    const { data: modules, error: modulesError } = await client
      .from('modules')
      .select('id, title, order, type, content_slug')
      .eq('course_id', course.id)
      .order('order');

    if (modulesError) {
      console.error('[training/progress] Error loading modules:', modulesError);
      return NextResponse.json({ error: 'Failed to load modules' }, { status: 500 });
    }

    console.log('[training/progress] Raw modules from DB:', modules?.map(m => ({ 
      title: m.title, 
      order: m.order, 
      type: m.type 
    })));

    // Get quiz attempts to determine which modules are completed
    const { data: quizAttempts } = await client
      .from('quiz_attempts')
      .select('module_id, passed')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .order('created_at', { ascending: false });

    // Create a map of completed modules (only the most recent attempt per module)
    const completedModules = new Map<string, boolean>();
    if (quizAttempts) {
      for (const attempt of quizAttempts) {
        if (attempt.module_id && !completedModules.has(attempt.module_id)) {
          completedModules.set(attempt.module_id, attempt.passed || false);
        }
      }
    }

    // Enhance modules with completion status and proper routes
    // Use same routing logic as getCourseModules (by order, NOT content_slug)
    const enhancedModules = (modules || []).map(m => {
      const isPassed = completedModules.get(m.id) || false;
      const slug = m.content_slug || `module-${m.order}`;
      let route = '';
      
      // Map by ORDER to actual module page routes (same as getCourseModules)
      if (m.order === 0 || /^introduction/i.test(m.title)) {
        route = '/training/orientation';
      } else if (m.order === 99 || m.title.includes('Course Completion')) {
        route = '/training/final';
      } else if (m.order === 1) {
        route = '/training/module-1';
      } else if (m.order === 2) {
        route = '/training/forklift-operator/module-2';
      } else if (m.order === 3) {
        route = '/training/forklift-operator/module-3';
      } else if (m.order === 4) {
        route = '/training/forklift-operator/module-4';
      } else if (m.order === 5) {
        route = '/training/forklift-operator/module-5';
      } else {
        route = `/training/module/${m.order}`;
      }

      return {
        id: m.id,
        title: m.title,
        order: m.order,
        type: m.type,
        slug: slug,
        route: route,
        quiz_passed: isPassed,
        href: route // Add href as alias for compatibility
      };
    });

    // Calculate if all training modules are complete (for exam unlock)
    // Only count modules with order 1-5 (training modules)
    // Order 0 = Introduction (not counted)
    // Order 99 = Course Completion (not counted)
    console.log('[training/progress] Enhanced modules:', enhancedModules.map(m => ({ 
      title: m.title, 
      order: m.order, 
      type: m.type 
    })));
    
    const trainingModules = enhancedModules.filter(m => m.order >= 1 && m.order <= 5);
    
    console.log('[training/progress] Training modules (1-5):', trainingModules.length);
    
    const completedCount = trainingModules.filter(m => m.quiz_passed).length;
    const allModulesComplete = trainingModules.length > 0 && completedCount === trainingModules.length;
    
    // Filter to only incomplete training modules for stepsLeft
    const incompleteModules = trainingModules.filter(m => !m.quiz_passed);
    const stepsLeft = incompleteModules.map(m => ({
      route: m.route,
      label: m.title
    }));

    const progress = {
      pct: enrollment.progress_pct || 0,
      stepsLeft,
      next: stepsLeft[0] || null,
      canTakeExam: allModulesComplete, // All 5 training modules must be complete
      modules: enhancedModules, // Return all modules for display
      completedCount,
      totalCount: trainingModules.length // Should be 5
    };

    return NextResponse.json(progress);
  } catch (error: any) {
    console.error('Training progress API error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  // Authenticate via cookie (web) or Bearer token (mobile)
  const { user, client } = await getAuthUser(req);
  if (!user || !client) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const moduleSlug: string = body?.moduleSlug;
  const stepKey: 'osha' | 'practice' | 'cards' | 'quiz' = body?.stepKey;
  const courseIdOrSlug: string | undefined = body?.courseId || body?.courseSlug || undefined;

  if (!moduleSlug || !stepKey) {
    return NextResponse.json({ ok: false, error: 'missing_params' }, { status: 400 });
  }

  const course = await resolveCourseForUser({ supabase: client, userId: user.id!, courseIdOrSlug: courseIdOrSlug || 'forklift' });
  if (!course.id) {
    return NextResponse.json({ ok: false, error: 'course_missing' }, { status: 422 });
  }

  // Load enrollment by course_id (preferred) or by course_slug (fallback)
  let enrollment: any = null;
  {
    const { data: enrById } = await client
      .from('enrollments')
      .select('id, resume_state, progress_pct')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .order('created_at', { ascending: false })
      .limit(1);
    enrollment = enrById?.[0] || null;
  }
  if (!enrollment && course.slug) {
    const { data: enrBySlug } = await client
      .from('enrollments')
      .select('id, resume_state, progress_pct')
      .eq('user_id', user.id)
      .eq('course_slug', course.slug)
      .order('created_at', { ascending: false })
      .limit(1);
    enrollment = enrBySlug?.[0] || null;
  }

  if (!enrollment) {
    return NextResponse.json({ ok: false, error: 'not_enrolled' }, { status: 404 });
  }

  const state = (enrollment.resume_state || {}) as any;
  state[moduleSlug] = { ...(state[moduleSlug] || {}), [stepKey]: true };

  const moduleSlugs = await getModuleSlugsForCourse(course.id, client);
  const pct = Math.max(0, Math.min(100, computePercentFractional(state, moduleSlugs)));

  const { error: updErr } = await client
    .from('enrollments')
    .update({ resume_state: state, progress_pct: pct, updated_at: new Date().toISOString() })
    .eq('id', enrollment.id);
  if (updErr) {
    return NextResponse.json({ ok: false, error: 'update_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, progress_pct: pct, resume_state: state });
}
