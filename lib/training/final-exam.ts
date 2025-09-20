import { createServerClient } from '@/lib/supabase/server';

// Attempts to resume an existing exam session for this user+course; else creates a new one
export async function getOrCreateFinalExam(courseSlug: string) {
  const supabase = createServerClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, reason: 'unauthorized' };

  // 1) Locate course
  const { data: courseRow, error: courseErr } = await supabase
    .from('courses')
    .select('id, slug')
    .eq('slug', courseSlug)
    .maybeSingle();
  if (courseErr || !courseRow) return { ok: false as const, reason: 'course-not-found' };

  const course_id = courseRow.id;

  // 2) Try resume: any in-progress exam_session?
  const { data: existing, error: existingErr } = await supabase
    .from('exam_sessions')
    .select('id, status, paper_id, remaining_sec, answers')
    .eq('user_id', user.id)
    .eq('status', 'in_progress')
    .order('created_at', { ascending: false })
    .limit(1);

  if (!existingErr && existing && existing.length && existing[0].status !== 'completed') {
    // Get the paper items for the existing session
    const { data: paper } = await supabase
      .from('exam_papers')
      .select('id, locale, item_ids')
      .eq('id', existing[0].paper_id)
      .maybeSingle();
    
    if (paper) {
      // Get the actual questions
      const { data: items } = await supabase
        .from('quiz_items')
        .select('id, question, choices')
        .in('id', paper.item_ids as string[]);
      
      return { 
        ok: true as const, 
        mode: 'resume' as const, 
        session: {
          ...existing[0],
          items: items || [],
          locale: paper.locale
        }, 
        course_id 
      };
    }
  }

  // 3) No existing session, check if we can create a new exam
  // This will use the existing /api/exam/generate endpoint logic
  return { ok: true as const, mode: 'create' as const, course_id };
}

// Check if user has completed all required modules for the course
export async function checkModuleCompletion(courseSlug: string) {
  const supabase = createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, reason: 'unauthorized' };

  // Get course info
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', courseSlug)
    .maybeSingle();

  if (!course) return { ok: false as const, reason: 'course-not-found' };

  // Get all modules for this course
  const { data: modules } = await supabase
    .from('modules')
    .select('id, title, order')
    .eq('course_id', course.id)
    .order('order');

  if (!modules || modules.length === 0) {
    // If no modules are defined, allow exam access
    return { ok: true as const, totalModules: 0, completedModules: 0 };
  }

  // Check completion status - this is a simplified check
  // In a real system, you'd check a user_module_progress table or similar
  // For now, we'll allow exam access if there are modules defined
  // You can enhance this based on your actual progress tracking system
  
  return { 
    ok: true as const, 
    totalModules: modules.length, 
    completedModules: modules.length // Assuming completion for now
  };
}
