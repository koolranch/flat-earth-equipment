// Enterprise Invitation Accept API
// Processes invitation acceptance using the accept_invitation database function

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Please sign in to accept this invitation' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Invitation token is required' }, 
        { status: 400 }
      );
    }

    // Call the accept_invitation database function
    // This function handles:
    // 1. Validating the token
    // 2. Adding user to org_members
    // 3. Creating enrollment if course_id is set
    // 4. Updating seat allocation
    // 5. Marking invitation as accepted
    // 6. Audit logging
    const { data: accepted, error: acceptError } = await supabase
      .rpc('accept_invitation', { p_token: token });

    if (acceptError) {
      console.error('Error accepting invitation:', acceptError);
      return NextResponse.json(
        { ok: false, error: 'Failed to accept invitation. Please try again.' }, 
        { status: 500 }
      );
    }

    if (!accepted) {
      // The function returns false if invitation not found, expired, or already accepted
      return NextResponse.json(
        { ok: false, error: 'This invitation is no longer valid. It may have expired or already been used.' }, 
        { status: 400 }
      );
    }

    // Success! Get the org details to return
    const { data: invitation } = await supabase
      .from('invitations')
      .select('org_id, course_id, orgs(name), courses(title, slug)')
      .eq('token', token)
      .maybeSingle();

    const org = Array.isArray(invitation?.orgs) ? invitation.orgs[0] : invitation?.orgs;
    const course = Array.isArray(invitation?.courses) ? invitation.courses[0] : invitation?.courses;

    return NextResponse.json({
      ok: true,
      message: 'Successfully joined organization',
      org_id: invitation?.org_id,
      org_name: org?.name,
      course_enrolled: !!invitation?.course_id,
      course_title: course?.title,
      course_slug: course?.slug
    });

  } catch (error) {
    console.error('Enterprise accept error:', error);
    return NextResponse.json(
      { ok: false, error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
}
