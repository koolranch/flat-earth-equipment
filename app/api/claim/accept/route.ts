import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { sendWelcomeEmail } from '@/lib/email/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const sb = supabaseServer();
  const svc = supabaseService();
  
  // Authentication check
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  // Parse request body
  const { token, firstName, lastName } = await req.json();
  if (!token) {
    return NextResponse.json({ ok: false, error: 'missing_token' }, { status: 400 });
  }
  
  // Validate name fields
  if (!firstName || !lastName) {
    return NextResponse.json({ ok: false, error: 'missing_name' }, { status: 400 });
  }

  try {
    // Fetch invitation details
    const { data: inv, error: invError } = await svc
      .from('seat_invites')
      .select('id, email, course_id, status, expires_at, claimed_at, created_by, courses(title)')
      .eq('invite_token', token)
      .maybeSingle();

    if (invError || !inv) {
      return NextResponse.json({ ok: false, error: 'invalid_token' }, { status: 404 });
    }

    // Check if invitation has expired
    if (inv.expires_at && new Date(inv.expires_at) < new Date()) {
      return NextResponse.json({ ok: false, error: 'invitation_expired' }, { status: 410 });
    }

    // Check if invitation has already been claimed
    if (inv.claimed_at) {
      return NextResponse.json({ ok: false, error: 'already_claimed' }, { status: 409 });
    }

    // Get user profile
    const { data: profile } = await svc
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ ok: false, error: 'profile_not_found' }, { status: 404 });
    }
    
    // Update profile with full name from claim form
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    try {
      await svc
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);
      
      // Also update auth user metadata for consistency
      await svc.auth.admin.updateUserById(user.id, {
        user_metadata: { full_name: fullName }
      });
    } catch (nameError) {
      console.error('Failed to update user name (non-blocking):', nameError);
      // Don't fail the claim if name update fails
    }

    // Verify email match (optional - could be flexible)
    const profileEmail = profile.email?.toLowerCase();
    const inviteEmail = inv.email?.toLowerCase();
    
    if (profileEmail !== inviteEmail) {
      // For now, we'll allow different emails but log it
      console.warn(`Email mismatch: profile=${profileEmail}, invite=${inviteEmail}`);
    }

    // Check if user already has an enrollment for this course
    const { data: existingEnrollment } = await svc
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', inv.course_id)
      .maybeSingle();

    let enrollmentId = existingEnrollment?.id;

    // Create enrollment if it doesn't exist
    if (!enrollmentId) {
      const { data: newEnrollment, error: enrollError } = await svc
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: inv.course_id,
          progress_pct: 0,
          passed: false,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (enrollError || !newEnrollment) {
        console.error('Error creating enrollment:', enrollError);
        return NextResponse.json({ 
          ok: false, 
          error: 'failed_to_create_enrollment' 
        }, { status: 500 });
      }

      enrollmentId = newEnrollment.id;
    }

    // Mark invitation as claimed
    const { error: claimError } = await svc
      .from('seat_invites')
      .update({
        status: 'claimed',
        claimed_at: new Date().toISOString(),
        claimed_by: user.id
      })
      .eq('id', inv.id);

    if (claimError) {
      console.error('Error marking invitation as claimed:', claimError);
      return NextResponse.json({ 
        ok: false, 
        error: 'failed_to_claim_invitation' 
      }, { status: 500 });
    }

    // Persist claim in seat_claims (idempotent)
    try {
      // Find the order for this trainer and course
      const { data: order } = await svc
        .from('orders')
        .select('id')
        .eq('user_id', inv.created_by)
        .eq('course_id', inv.course_id)
        .maybeSingle();

      if (order) {
        await svc
          .from('seat_claims')
          .upsert({ 
            order_id: order.id, 
            user_id: user.id,
            created_at: new Date().toISOString()
          }, { 
            onConflict: 'order_id,user_id', 
            ignoreDuplicates: false 
          });
      }
    } catch (e) {
      console.error('seat_claims upsert failed', e);
      // Don't fail the request if seat_claims fails
    }

    // Get course details for welcome email
    const course = Array.isArray(inv.courses) ? inv.courses[0] : inv.courses;
    const courseTitle = course?.title || 'Forklift Operator Training';

    // Send welcome email (best effort)
    if (process.env.RESEND_API_KEY && profile.email) {
      try {
        await sendWelcomeEmail({
          to: profile.email,
          name: profile.full_name,
          courseTitle
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Log audit trail
    try {
      await svc.from('audit_log').insert({
        actor_id: user.id,
        action: 'seat_claimed',
        metadata: {
          invite_id: inv.id,
          course_id: inv.course_id,
          enrollment_id: enrollmentId,
          invite_email: inv.email,
          profile_email: profile.email,
          course_title: courseTitle
        }
      });
    } catch (auditError) {
      console.error('Error logging seat claim audit:', auditError);
      // Don't fail the request if audit logging fails
    }

    return NextResponse.json({
      ok: true,
      enrollment_id: enrollmentId,
      course_id: inv.course_id,
      course_title: courseTitle,
      message: 'Seat claimed successfully! Welcome to the training.'
    });

  } catch (error) {
    console.error('Unexpected error in claim accept:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'internal_server_error' 
    }, { status: 500 });
  }
}
