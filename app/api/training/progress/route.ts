import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getForkliftCourseId, getForkliftModuleSlugs, computePercentFractional, resolveCourseForUser, getModuleSlugsForCourse } from '@/lib/training/progress-utils';

was export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseParam = searchParams.get('courseId') || searchParams.get('courseSlug') || 'forklift';
    
    console.log('[training/progress] Request for courseParam:', courseParam);

    // Get the user's session from cookies - try multiple cookie patterns
    const cookieStore = cookies();
    
    // Try the dashboard-data pattern first
    let accessToken = cookieStore.get('sb-access-token')?.value;
    let refreshToken = cookieStore.get('sb-refresh-token')?.value;
    
    // If not found, try the standard Supabase SSR pattern
    if (!accessToken) {
      // Look for standard Supabase auth cookies
      const authCookies = Array.from(cookieStore.getAll()).filter(cookie => 
        cookie.name.includes('supabase') || cookie.name.includes('sb-')
      );
      
      console.log('[training/progress] Available cookies:', authCookies.map(c => c.name));
      
      // Try to find any auth-related cookies
      for (const cookie of authCookies) {
        console.log('[training/progress] Cookie:', cookie.name, 'has value:', !!cookie.value);
      }
    }

    console.log('[training/progress] Auth cookies:', { 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken,
      totalCookies: cookieStore.getAll().length
    });

    // Try using supabaseServer as fallback
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseServer.auth.getUser();
    console.log('[training/progress] Supabase server auth result:', { 
      hasUser: !!user, 
      userId: user?.id, 
      email: user?.email,
      error: userError?.message 
    });

    // If SSR auth failed but we have cookies, try manual session validation
    if ((!user || userError) && accessToken && refreshToken) {
      console.log('[training/progress] SSR auth failed, trying manual session validation');
      
      const manualClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: sessionData, error: sessionError } = await manualClient.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      console.log('[training/progress] Manual session result:', {
        hasUser: !!sessionData.user,
        userId: sessionData.user?.id,
        email: sessionData.user?.email,
        error: sessionError?.message
      });
      
      if (sessionData.user && !sessionError) {
        // Use the manually validated user
        const validatedUser = sessionData.user;
        
        // Use the new resolver to avoid UUID casting errors
        const course = await resolveCourseForUser({ 
          supabase: manualClient, 
          userId: validatedUser.id, 
          courseIdOrSlug: courseParam 
        });
        if (!course.id) {
          return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Get enrollment by course_id or course_slug
        let enrollment: any = null;
        {
          const { data: enrById } = await manualClient
            .from('enrollments')
            .select('id, progress_pct, passed, resume_state')
            .eq('user_id', validatedUser.id)
            .eq('course_id', course.id)
            .order('created_at', { ascending: false })
            .limit(1);
          enrollment = enrById?.[0] || null;
        }
        if (!enrollment && course.slug) {
          const { data: enrBySlug } = await manualClient
            .from('enrollments')
            .select('id, progress_pct, passed, resume_state')
            .eq('user_id', validatedUser.id)
            .eq('course_slug', course.slug)
            .order('created_at', { ascending: false })
            .limit(1);
          enrollment = enrBySlug?.[0] || null;
        }

        console.log('[training/progress] Manual enrollment lookup:', enrollment ? `found ${enrollment.id}` : 'none');

        if (!enrollment) {
          console.log('[training/progress] No enrollment found for user:', validatedUser.id, 'course:', course.id);
          return NextResponse.json({ error: 'No enrollment found' }, { status: 404 });
        }

        // Get modules for this course
        const { data: modules, error: modulesError } = await manualClient
          .from('modules')
          .select('id, title, order, type, content_slug')
          .eq('course_id', course.id)
          .order('order');

        if (modulesError) {
          return NextResponse.json({ error: 'Failed to load modules' }, { status: 500 });
        }

        // Get quiz attempts to determine which modules are completed
        const { data: quizAttempts } = await manualClient
          .from('quiz_attempts')
          .select('module_id, passed')
          .eq('user_id', validatedUser.id)
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
        const enhancedModules = (modules || []).map(m => {
          const isPassed = completedModules.get(m.id) || false;
          const slug = m.content_slug || `module-${m.order}`;
          let route = '';
          
          // Build proper route based on module order/type
          if (m.order === 0 || /^introduction/i.test(m.title)) {
            route = `/training?courseId=${course.id}#intro`;
          } else if (m.title === 'Course Completion') {
            route = `/training/complete?courseId=${course.id}`;
          } else {
            route = `/training/modules/${slug}?courseId=${course.id}`;
          }

          return {
            id: m.id,
            title: m.title,
            order: m.order,
            type: m.type,
            slug: slug,
            route: route,
            quiz_passed: isPassed
          };
        });

        // Calculate if all content modules are complete (for exam unlock)
        // Only count the 5 main training modules (exclude Introduction and Course Completion)
        const contentModules = enhancedModules.filter(m => 
          m.order > 0 && !m.title.includes('Complete') && !m.title.includes('Introduction')
        );
        const completedCount = contentModules.filter(m => m.quiz_passed).length;
        const allModulesComplete = contentModules.length > 0 && completedCount === contentModules.length;
        
        // Filter to only incomplete CONTENT modules for stepsLeft (not intro/completion)
        const incompleteContentModules = contentModules.filter(m => !m.quiz_passed);
        const stepsLeft = incompleteContentModules.map(m => ({
          route: m.route,
          label: m.title
        }));

        const progress = {
          pct: enrollment.progress_pct || 0,
          stepsLeft,
          next: stepsLeft[0] || null,
          canTakeExam: allModulesComplete,
          modules: enhancedModules,
          completedCount,
          totalCount: contentModules.length
        };

        console.log('[training/progress] Manual auth success, returning progress:', { pct: progress.pct, moduleCount: modules?.length, completedCount, totalCount: contentModules.length });
        return NextResponse.json(progress);
      }
    }

    if (userError || !user) {
      console.log('[training/progress] No valid user session found');
      return NextResponse.json({ 
        error: 'unauthorized',
        debug: {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          userError: userError?.message,
          totalCookies: cookieStore.getAll().length
        }
      }, { status: 401 });
    }

    // Use the new resolver to avoid UUID casting errors
    const course = await resolveCourseForUser({ 
      supabase: supabaseServer, 
      userId: user.id, 
      courseIdOrSlug: courseParam 
    });
    if (!course.id) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Get enrollment by course_id or course_slug
    let enrollment: any = null;
    {
      const { data: enrById } = await supabaseServer
        .from('enrollments')
        .select('id, progress_pct, passed, resume_state')
        .eq('user_id', user.id)
        .eq('course_id', course.id)
        .order('created_at', { ascending: false })
        .limit(1);
      enrollment = enrById?.[0] || null;
    }
    if (!enrollment && course.slug) {
      const { data: enrBySlug } = await supabaseServer
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
    const { data: modules, error: modulesError } = await supabaseServer
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
    const { data: quizAttempts } = await supabaseServer
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
    const enhancedModules = (modules || []).map(m => {
      const isPassed = completedModules.get(m.id) || false;
      const slug = m.content_slug || `module-${m.order}`;
      let route = '';
      
      // Build proper route based on module order/type
      if (m.order === 0 || /^introduction/i.test(m.title)) {
        route = `/training?courseId=${course.id}#intro`;
      } else if (m.title === 'Course Completion') {
        route = `/training/complete?courseId=${course.id}`;
      } else {
        route = `/training/modules/${slug}?courseId=${course.id}`;
      }

      return {
        id: m.id,
        title: m.title,
        order: m.order,
        type: m.type,
        slug: slug,
        route: route,
        quiz_passed: isPassed
      };
    });

    // Calculate if all content modules are complete (for exam unlock)
    // Only count the 5 main training modules (exclude Introduction and Course Completion)
    console.log('[training/progress] Enhanced modules:', enhancedModules.map(m => ({ 
      title: m.title, 
      order: m.order, 
      type: m.type 
    })));
    
    const contentModules = enhancedModules.filter(m => {
      const shouldInclude = m.order > 0 && !m.title.includes('Complete') && !m.title.includes('Introduction');
      console.log('[training/progress] Filter module:', { 
        title: m.title, 
        order: m.order, 
        shouldInclude 
      });
      return shouldInclude;
    });
    
    console.log('[training/progress] Content modules count:', contentModules.length);
    
    const completedCount = contentModules.filter(m => m.quiz_passed).length;
    const allModulesComplete = contentModules.length > 0 && completedCount === contentModules.length;
    
    // Filter to only incomplete CONTENT modules for stepsLeft (not intro/completion)
    const incompleteContentModules = contentModules.filter(m => !m.quiz_passed);
    const stepsLeft = incompleteContentModules.map(m => ({
      route: m.route,
      label: m.title
    }));

    const progress = {
      pct: enrollment.progress_pct || 0,
      stepsLeft,
      next: stepsLeft[0] || null,
      canTakeExam: allModulesComplete, // All content modules must be complete
      modules: enhancedModules,
      completedCount,
      totalCount: contentModules.length
    };

    return NextResponse.json(progress);
  } catch (error: any) {
    console.error('Training progress API error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const moduleSlug: string = body?.moduleSlug;
  const stepKey: 'osha' | 'practice' | 'cards' | 'quiz' = body?.stepKey;
  const courseIdOrSlug: string | undefined = body?.courseId || body?.courseSlug || undefined;

  if (!moduleSlug || !stepKey) {
    return NextResponse.json({ ok: false, error: 'missing_params' }, { status: 400 });
  }

  const course = await resolveCourseForUser({ supabase, userId: user.id!, courseIdOrSlug: courseIdOrSlug || 'forklift' });
  if (!course.id) {
    return NextResponse.json({ ok: false, error: 'course_missing' }, { status: 422 });
  }

  // Load enrollment by course_id (preferred) or by course_slug (fallback)
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

  if (!enrollment) {
    return NextResponse.json({ ok: false, error: 'not_enrolled' }, { status: 404 });
  }

  const state = (enrollment.resume_state || {}) as any;
  state[moduleSlug] = { ...(state[moduleSlug] || {}), [stepKey]: true };

  const moduleSlugs = await getModuleSlugsForCourse(course.id, supabase);
  const pct = Math.max(0, Math.min(100, computePercentFractional(state, moduleSlugs)));

  const { error: updErr } = await supabase
    .from('enrollments')
    .update({ resume_state: state, progress_pct: pct, updated_at: new Date().toISOString() })
    .eq('id', enrollment.id);
  if (updErr) {
    return NextResponse.json({ ok: false, error: 'update_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, progress_pct: pct, resume_state: state });
}
