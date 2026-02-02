// Enterprise User Invite API
// Creates invitation and sends email

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { randomBytes } from 'node:crypto';
import { Resend } from 'resend';

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
    const { email, full_name, role, org_id, course_id } = body;

    // Validate required fields
    if (!email || !org_id) {
      return NextResponse.json({ ok: false, error: 'Email and org_id are required' }, { status: 400 });
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

    // Check if user already exists in org
    const svc = supabaseService();
    const { data: existingMember } = await svc
      .from('org_members')
      .select('user_id')
      .eq('org_id', org_id)
      .eq('user_id', (
        await svc.from('profiles').select('id').eq('email', email).maybeSingle()
      ).data?.id)
      .maybeSingle();

    if (existingMember) {
      return NextResponse.json({ ok: false, error: 'User is already a member of this organization' }, { status: 400 });
    }

    // Check for existing pending invitation
    const { data: existingInvite } = await svc
      .from('invitations')
      .select('id')
      .eq('org_id', org_id)
      .eq('email', email)
      .is('accepted_at', null)
      .maybeSingle();

    if (existingInvite) {
      return NextResponse.json({ ok: false, error: 'An invitation is already pending for this email' }, { status: 400 });
    }

    // Generate invite token
    const token = randomBytes(24).toString('base64url');
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

    // Map role to database role
    const dbRole = role === 'admin' ? 'trainer' : role === 'manager' ? 'trainer' : role || 'learner';

    // If course specified, verify it exists and check seat availability
    let courseName = '';
    if (course_id) {
      const { data: course } = await svc
        .from('courses')
        .select('id, title')
        .eq('id', course_id)
        .maybeSingle();
      
      if (!course) {
        return NextResponse.json({ ok: false, error: 'Selected course not found' }, { status: 400 });
      }
      courseName = course.title;

      // Check seat availability
      const { data: seatData } = await svc
        .from('org_seats')
        .select('total_seats, allocated_seats')
        .eq('org_id', org_id)
        .eq('course_id', course_id)
        .maybeSingle();

      if (seatData && seatData.allocated_seats >= seatData.total_seats) {
        return NextResponse.json({ 
          ok: false, 
          error: `No seats available for ${courseName}` 
        }, { status: 400 });
      }
    }

    // Create invitation record
    const { error: insertError } = await svc
      .from('invitations')
      .insert({
        org_id,
        email,
        role: dbRole,
        token,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
        course_id: course_id || null
      });

    if (insertError) {
      console.error('Failed to create invitation:', insertError);
      return NextResponse.json({ ok: false, error: 'Failed to create invitation' }, { status: 500 });
    }

    // Get org name for email
    const { data: org } = await svc.from('orgs').select('name').eq('id', org_id).maybeSingle();
    const orgName = org?.name || 'your organization';

    // Send invitation email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.flatearthequipment.com';
    const acceptUrl = `${baseUrl}/invite/accept?token=${token}`;

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        
        // Build email content based on whether course is assigned
        const trainingInfo = courseName 
          ? `\n\nYou've been assigned to complete: ${courseName}\nYour training will begin as soon as you accept this invitation.`
          : '';
        
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'Flat Earth Safety <no-reply@flatearthequipment.com>',
          to: email,
          subject: courseName 
            ? `${orgName} has enrolled you in ${courseName}`
            : `You've been invited to join ${orgName}`,
          text: `Hi${full_name ? ` ${full_name}` : ''},

You've been invited to join ${orgName} on Flat Earth Safety for forklift operator training.${trainingInfo}

Click here to accept your invitation and get started:
${acceptUrl}

This invitation expires in 14 days.

If you weren't expecting this invitation, you can safely ignore this email.

---
Flat Earth Safety
OSHA-Compliant Forklift Operator Training`
        });
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError);
        // Don't fail the request - invitation was created, email just didn't send
      }
    } else {
      console.warn('RESEND_API_KEY not set - invitation created but email not sent');
    }

    return NextResponse.json({
      ok: true,
      message: courseName 
        ? `Invitation sent with ${courseName} training assignment`
        : 'Invitation sent successfully',
      email,
      course_assigned: !!course_id,
      course_name: courseName || null,
      expires_at: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Enterprise invite error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to send invitation' }, { status: 500 });
  }
}
