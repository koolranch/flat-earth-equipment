import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
