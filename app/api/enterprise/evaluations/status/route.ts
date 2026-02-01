// Enterprise Evaluation Status API
// Returns practical evaluation status for given user IDs

import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { user_ids } = body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json({
        ok: true,
        evaluations: []
      });
    }

    // Fetch evaluation status from employer_evaluations table
    const svc = supabaseService();
    
    // Get enrollments for these users first
    const { data: enrollments } = await svc
      .from('enrollments')
      .select('id, user_id')
      .in('user_id', user_ids);

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({
        ok: true,
        evaluations: []
      });
    }

    const enrollmentIds = enrollments.map(e => e.id);
    const userEnrollmentMap = new Map(enrollments.map(e => [e.id, e.user_id]));

    // Get evaluations for these enrollments
    const { data: evaluations } = await svc
      .from('employer_evaluations')
      .select('enrollment_id, practical_pass, evaluation_date, evaluator_name, finalized')
      .in('enrollment_id', enrollmentIds);

    // Map evaluations back to user_ids
    const evalByUser = new Map<string, any>();
    (evaluations || []).forEach(ev => {
      const userId = userEnrollmentMap.get(ev.enrollment_id);
      if (userId) {
        evalByUser.set(userId, {
          user_id: userId,
          enrollment_id: ev.enrollment_id,
          practical_pass: ev.practical_pass,
          evaluation_date: ev.evaluation_date,
          evaluator_name: ev.evaluator_name,
          finalized: ev.finalized
        });
      }
    });

    // Return evaluations array
    const result = user_ids.map(uid => {
      const ev = evalByUser.get(uid);
      return ev || { user_id: uid, practical_pass: null };
    });

    return NextResponse.json({
      ok: true,
      evaluations: result
    });

  } catch (error) {
    console.error('Evaluation status API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch evaluation status' },
      { status: 500 }
    );
  }
}
