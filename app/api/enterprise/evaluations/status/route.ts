// Enterprise Evaluation Status API
// Returns practical evaluation status for given user IDs

import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { getAuthUser } from '@/lib/supabase/mobile-auth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { user } = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { user_ids, org_id } = body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json({
        ok: true,
        evaluations: []
      });
    }

    const svc = supabaseService();
    let allowedOrgIds: string[] = [];

    if (org_id) {
      const { data: membership } = await svc
        .from('org_members')
        .select('org_id')
        .eq('org_id', org_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!membership) {
        return NextResponse.json({ ok: false, error: 'Access denied' }, { status: 403 });
      }
      allowedOrgIds = [org_id];
    } else {
      const { data: memberships } = await svc
        .from('org_members')
        .select('org_id')
        .eq('user_id', user.id);
      allowedOrgIds = (memberships || []).map((membership) => membership.org_id).filter(Boolean);
    }

    if (allowedOrgIds.length === 0) {
      return NextResponse.json({ ok: true, evaluations: [] });
    }
    
    // Get enrollments for these users first
    let enrollmentQuery = svc
      .from('enrollments')
      .select('id, user_id')
      .in('user_id', user_ids)
      .in('org_id', allowedOrgIds);

    const { data: enrollments } = await enrollmentQuery;

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
