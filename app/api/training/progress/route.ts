import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    
    if (!courseId) {
      return NextResponse.json({ error: 'courseId required' }, { status: 400 });
    }

    const supabase = supabaseServer();
    
    // Get current user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // Get enrollment for this user and course
    const { data: enrollment, error: enrollError } = await supabase
      .from('enrollments')
      .select('id, progress_pct, passed, resume_state')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();

    if (enrollError || !enrollment) {
      return NextResponse.json({ error: 'No enrollment found' }, { status: 404 });
    }

    // Get modules for this course
    const { data: modules, error: modulesError } = await supabase
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
