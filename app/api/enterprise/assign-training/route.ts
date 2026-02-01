// Enterprise Assign Training API
// Assigns a course to one or more users in the organization

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { user_ids, course_id, org_id } = body;

    // Validate required fields
    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json({ ok: false, error: 'user_ids array is required' }, { status: 400 });
    }
    if (!course_id) {
      return NextResponse.json({ ok: false, error: 'course_id is required' }, { status: 400 });
    }
    if (!org_id) {
      return NextResponse.json({ ok: false, error: 'org_id is required' }, { status: 400 });
    }

    // Verify requester has permission (admin or owner of the org)
    const { data: membership } = await supabase
      .from('org_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('org_id', org_id)
      .maybeSingle();

    if (!membership || !['owner', 'admin'].includes(membership.role?.toLowerCase())) {
      return NextResponse.json({ ok: false, error: 'Permission denied' }, { status: 403 });
    }

    const svc = supabaseService();

    // Get course details
    const { data: course } = await svc
      .from('courses')
      .select('id, title, slug')
      .eq('id', course_id)
      .maybeSingle();

    if (!course) {
      return NextResponse.json({ ok: false, error: 'Course not found' }, { status: 404 });
    }

    // Get user details for the selected users
    const { data: users } = await svc
      .from('profiles')
      .select('id, email')
      .in('id', user_ids);

    if (!users || users.length === 0) {
      return NextResponse.json({ ok: false, error: 'No valid users found' }, { status: 400 });
    }

    // Create enrollments for each user
    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[]
    };

    for (const targetUser of users) {
      try {
        // Check if enrollment already exists
        const { data: existing } = await svc
          .from('enrollments')
          .select('id')
          .eq('user_id', targetUser.id)
          .eq('course_id', course_id)
          .maybeSingle();

        if (existing) {
          results.skipped++;
          continue;
        }

        // Create enrollment
        const { error: enrollError } = await svc
          .from('enrollments')
          .insert({
            user_id: targetUser.id,
            course_id: course_id,
            org_id: org_id,
            learner_email: targetUser.email,
            progress_pct: 0,
            passed: false
          });

        if (enrollError) {
          console.error(`Failed to enroll user ${targetUser.email}:`, enrollError);
          results.errors.push(`${targetUser.email}: ${enrollError.message}`);
        } else {
          results.created++;
        }

      } catch (err: any) {
        results.errors.push(`${targetUser.email}: ${err.message}`);
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Training assigned to ${results.created} user(s)`,
      course_title: course.title,
      results
    });

  } catch (error) {
    console.error('Assign training error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to assign training' }, { status: 500 });
  }
}

// GET - List available courses
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const svc = supabaseService();
    
    const { data: courses, error } = await svc
      .from('courses')
      .select('id, title, slug, description')
      .order('title');

    if (error) {
      return NextResponse.json({ ok: false, error: 'Failed to fetch courses' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      courses: courses || []
    });

  } catch (error) {
    console.error('Get courses error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch courses' }, { status: 500 });
  }
}
