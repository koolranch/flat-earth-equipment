import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { moduleId, score, passed } = await req.json();
    
    if (!moduleId) {
      return NextResponse.json({ error: 'Missing moduleId' }, { status: 400 });
    }

    console.log('[quiz-complete] Processing quiz completion:', { moduleId, score, passed });

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
      console.log('[quiz-complete] No valid user session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the forklift course first
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, slug')
      .eq('slug', 'forklift')
      .single();
    
    console.log('[quiz-complete] Course lookup result:', course ? `found: ${course.id}` : 'not found', courseError?.message);
    
    if (!course) {
      console.error('[quiz-complete] Forklift course not found');
      return NextResponse.json({ error: 'Course not found', details: courseError?.message }, { status: 404 });
    }
    
    // Get ALL modules for this course and filter in JavaScript
    // (Avoids potential Supabase query issues with numeric comparison)
    console.log('[quiz-complete] Looking up module with identifier:', moduleId, 'type:', typeof moduleId, 'courseId:', course.id);
    
    const { data: allModules, error: modulesError } = await supabase
      .from('modules')
      .select('id, course_id, title, order, type')
      .eq('course_id', course.id);
    
    console.log('[quiz-complete] Loaded all modules:', allModules?.length, 'modules');
    
    if (modulesError) {
      console.error('[quiz-complete] Error loading modules:', modulesError);
      return NextResponse.json({ error: 'Error loading modules', details: modulesError.message }, { status: 500 });
    }
    
    // Find the module by ID or order
    let moduleData: any = null;
    
    if (allModules) {
      // Try UUID match first
      moduleData = allModules.find(m => m.id === moduleId);
      
      // If not found, try order match
      if (!moduleData) {
        const orderNum = Number(moduleId);
        moduleData = allModules.find(m => m.order === orderNum);
        console.log('[quiz-complete] Searching for order:', orderNum, 'found:', !!moduleData);
      }
    }

    if (!moduleData) {
      // Debug: List all modules in the course to see what's available
      const { data: allModules } = await supabase
        .from('modules')
        .select('id, order, title')
        .eq('course_id', course.id)
        .order('order');
      
      console.error('[quiz-complete] Module not found. Searched for:', moduleId);
      console.error('[quiz-complete] Available modules:', allModules?.map(m => ({ order: m.order, title: m.title })));
      
      return NextResponse.json({ 
        error: 'Module not found', 
        searched: moduleId,
        available: allModules?.map(m => m.order)
      }, { status: 404 });
    }

    console.log('[quiz-complete] Found module:', { 
      id: moduleData.id, 
      title: moduleData.title, 
      order: moduleData.order,
      courseId: moduleData.course_id
    });

    // Save quiz attempt to database
    const { error: insertError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        course_id: moduleData.course_id,
        module_id: moduleData.id,
        mode: 'full',
        seed: `quiz-${Date.now()}`,
        question_ids: [], // Could be populated if we track individual questions
        incorrect_ids: [],
        correct_count: passed ? 1 : 0,
        total_count: 1,
        score: score || 0,
        passed: passed || false
      });

    if (insertError) {
      console.error('[quiz-complete] Error creating quiz attempt:', insertError);
      return NextResponse.json({ error: 'Failed to save quiz attempt' }, { status: 500 });
    }

    // Update enrollment progress_pct
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id, course_id, progress_pct')
      .eq('user_id', user.id)
      .eq('course_id', moduleData.course_id)
      .maybeSingle();

    if (enrollment) {
      // Get total training modules (order 1-5)
      const { data: allModules } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', moduleData.course_id)
        .gte('order', 1)
        .lte('order', 5);

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

        console.log('[quiz-complete] Updating progress:', {
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

    console.log('[quiz-complete] Quiz completion saved successfully');
    return NextResponse.json({ ok: true, passed });

  } catch (error: any) {
    console.error('[quiz-complete] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

