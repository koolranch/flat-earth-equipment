import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { moduleId } = await req.json();
    
    if (!moduleId) {
      return NextResponse.json({ error: 'Missing moduleId' }, { status: 400 });
    }

    console.log('[video-complete] Processing video completion for moduleId:', moduleId);

    // Create Supabase client
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

    // Get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('[video-complete] No valid user session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the module by ID or order number
    let moduleData: any = null;
    
    // First try to find by UUID
    const { data: moduleById } = await supabase
      .from('modules')
      .select('id, course_id, title, order, type')
      .eq('id', moduleId)
      .maybeSingle();
    
    if (moduleById) {
      moduleData = moduleById;
    } else {
      // If not found by UUID, try by order number
      const { data: moduleByOrder } = await supabase
        .from('modules')
        .select('id, course_id, title, order, type')
        .eq('order', moduleId)
        .maybeSingle();
      
      if (moduleByOrder) {
        moduleData = moduleByOrder;
      }
    }

    if (!moduleData) {
      console.log('[video-complete] Module not found:', moduleId);
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    console.log('[video-complete] Found module:', { 
      id: moduleData.id, 
      title: moduleData.title, 
      order: moduleData.order,
      courseId: moduleData.course_id
    });

    // Check if this module already has a passing quiz attempt
    const { data: existingAttempt } = await supabase
      .from('quiz_attempts')
      .select('id, passed')
      .eq('user_id', user.id)
      .eq('module_id', moduleData.id)
      .eq('passed', true)
      .maybeSingle();

    if (existingAttempt) {
      console.log('[video-complete] Module already marked as complete');
      return NextResponse.json({ ok: true, message: 'Already complete' });
    }

    // Create a quiz_attempt entry to mark the video-only module as complete
    const { error: insertError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        course_id: moduleData.course_id,
        module_id: moduleData.id,
        mode: 'full',
        seed: 'video-complete',
        question_ids: [],
        incorrect_ids: [],
        correct_count: 1,
        total_count: 1,
        score: 100,
        passed: true
      });

    if (insertError) {
      console.error('[video-complete] Error creating quiz attempt:', insertError);
      return NextResponse.json({ error: 'Failed to save completion' }, { status: 500 });
    }

    // Update enrollment progress_pct if needed
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id, course_id, progress_pct')
      .eq('user_id', user.id)
      .eq('course_id', moduleData.course_id)
      .maybeSingle();

    if (enrollment) {
      // Get total modules and completed modules
      const { data: allModules } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', moduleData.course_id)
        .gt('order', 0); // Exclude intro if order 0

      const { data: completedAttempts } = await supabase
        .from('quiz_attempts')
        .select('module_id')
        .eq('user_id', user.id)
        .eq('course_id', moduleData.course_id)
        .eq('passed', true);

      if (allModules && completedAttempts) {
        const totalModules = allModules.length;
        const completedCount = new Set(completedAttempts.map(a => a.module_id)).size;
        const newProgress = Math.round((completedCount / totalModules) * 100);

        console.log('[video-complete] Updating progress:', {
          completed: completedCount,
          total: totalModules,
          newProgress
        });

        await supabase
          .from('enrollments')
          .update({ 
            progress_pct: newProgress,
            updated_at: new Date().toISOString()
          })
          .eq('id', enrollment.id);
      }
    }

    console.log('[video-complete] Video completion saved successfully');
    return NextResponse.json({ ok: true });

  } catch (error: any) {
    console.error('[video-complete] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

