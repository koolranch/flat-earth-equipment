import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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

    // Get the user's session from cookies (same pattern as dashboard-data)
    const cookieStore = cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;

    console.log('[training/progress] Auth cookies:', { 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken 
    });

    if (!accessToken) {
      console.log('[training/progress] No access token found');
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // Create regular client to get user info
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Set session for regular client
    const { data: { user }, error: userError } = await supabaseClient.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || ''
    });

    console.log('[training/progress] User auth:', user ? `${user.id} (${user.email})` : 'none', userError?.message);
    
    if (userError || !user) {
      console.log('[training/progress] Invalid session');
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // Get enrollment for this user and course
    const { data: enrollment, error: enrollError } = await supabaseClient
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
    const { data: modules, error: modulesError } = await supabaseClient
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
