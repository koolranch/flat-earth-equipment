import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getForkliftCourseId, getForkliftModuleSlugs, computePercentFractional } from '@/lib/training/progress-utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    
    console.log('[training/progress] Request for courseId:', courseId);
    
    if (!courseId) {
      console.log('[training/progress] Missing courseId');
      return NextResponse.json({ error: 'courseId required' }, { status: 400 });
    }

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
        
        // Get enrollment for this user and course using manual client
        const { data: enrollment, error: enrollError } = await manualClient
          .from('enrollments')
          .select('id, progress_pct, passed, resume_state')
          .eq('user_id', validatedUser.id)
          .eq('course_id', courseId)
          .single();

        console.log('[training/progress] Manual enrollment lookup:', enrollment ? `found ${enrollment.id}` : 'none', enrollError?.message);

        if (enrollError || !enrollment) {
          console.log('[training/progress] No enrollment found for user:', validatedUser.id, 'course:', courseId);
          return NextResponse.json({ error: 'No enrollment found', details: enrollError?.message }, { status: 404 });
        }

        // Get modules for this course
        const { data: modules, error: modulesError } = await manualClient
          .from('modules')
          .select('id, title, order, type')
          .eq('course_id', courseId)
          .order('order');

        if (modulesError) {
          return NextResponse.json({ error: 'Failed to load modules' }, { status: 500 });
        }

        // Build progress response
        const stepsLeft = (modules || []).map(m => ({
          route: `/module/${m.id}`,
          label: m.title
        }));

        const progress = {
          pct: enrollment.progress_pct || 0,
          stepsLeft,
          next: stepsLeft[0] || null,
          canTakeExam: (enrollment.progress_pct || 0) >= 80,
          modules: modules || []
        };

        console.log('[training/progress] Manual auth success, returning progress:', { pct: progress.pct, moduleCount: modules?.length });
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

    // Get enrollment for this user and course
    const { data: enrollment, error: enrollError } = await supabaseServer
      .from('enrollments')
      .select('id, progress_pct, passed, resume_state')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();

    console.log('[training/progress] Enrollment lookup:', enrollment ? `found ${enrollment.id}` : 'none', enrollError?.message);

    if (enrollError || !enrollment) {
      console.log('[training/progress] No enrollment found for user:', user.id, 'course:', courseId);
      return NextResponse.json({ error: 'No enrollment found', details: enrollError?.message }, { status: 404 });
    }

    // Get modules for this course
    const { data: modules, error: modulesError } = await supabaseServer
      .from('modules')
      .select('id, title, order, type')
      .eq('course_id', courseId)
      .order('order');

    if (modulesError) {
      return NextResponse.json({ error: 'Failed to load modules' }, { status: 500 });
    }

    // Build progress response
    const stepsLeft = (modules || []).map(m => ({
      route: `/module/${m.id}`,
      label: m.title
    }));

    const progress = {
      pct: enrollment.progress_pct || 0,
      stepsLeft,
      next: stepsLeft[0] || null,
      canTakeExam: (enrollment.progress_pct || 0) >= 80, // 80% completion required for exam
      modules: modules || []
    };

    return NextResponse.json(progress);
  } catch (error: any) {
    console.error('Training progress API error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
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
    // allow optional course identifier from client (uuid OR slug)
    const courseIdOrSlug: string | undefined = body?.courseId || body?.courseSlug || undefined;

    if (!moduleSlug || !stepKey) {
      return NextResponse.json({ ok: false, error: 'missing_params' }, { status: 400 });
    }

    const course = await resolveCourseForUser({ supabase, userId: user.id, courseIdOrSlug });
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
    const pct = computePercentFractional(state, moduleSlugs);

    const { error: updErr } = await supabase
      .from('enrollments')
      .update({ resume_state: state, progress_pct: pct, updated_at: new Date().toISOString() })
      .eq('id', enrollment.id);
    if (updErr) {
      return NextResponse.json({ ok: false, error: 'update_failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, progress_pct: pct, resume_state: state });
  } catch (error: any) {
    console.error('Training progress PATCH error:', error);
    return NextResponse.json({ ok: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
