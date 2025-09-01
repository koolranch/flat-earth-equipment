import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { sendInviteEmail } from '@/lib/email/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { invite_id } = await req.json();
  
  if (!invite_id) {
    return NextResponse.json({ ok: false, error: 'missing_invite_id' }, { status: 400 });
  }

  const sb = supabaseServer();
  const svc = supabaseService();
  
  // Authentication check
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  // Role authorization check
  const { data: prof } = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!prof || !['trainer', 'admin'].includes(prof.role)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  try {
    // Fetch invitation details (only invites created by this trainer)
    const { data: invitation, error: inviteError } = await svc
      .from('seat_invites')
      .select('id, email, course_id, status, created_at')
      .eq('id', invite_id)
      .eq('created_by', user.id)
      .maybeSingle();

    if (inviteError || !invitation) {
      return NextResponse.json({ ok: false, error: 'invitation_not_found' }, { status: 404 });
    }

    // Check if invitation can be resent
    if (!['pending', 'sent'].includes(invitation.status)) {
      return NextResponse.json({ 
        ok: false, 
        error: 'invalid_status', 
        message: `Cannot resend invitation with status: ${invitation.status}. Only pending or sent invitations can be resent.`
      }, { status: 400 });
    }

    // Generate new token and expiry
    const newToken = randomBytes(24).toString('base64url');
    const newExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 14 days
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const claimUrl = `${baseUrl}/claim/${newToken}`;

    // Get course details for email
    const { data: course } = await svc
      .from('courses')
      .select('title')
      .eq('id', invitation.course_id)
      .maybeSingle();

    const courseTitle = course?.title || 'Forklift Operator Training';

    // Send email invitation
    await sendInviteEmail({
      to: invitation.email,
      claimUrl,
      courseTitle
    });

    // Update invitation with new token, expiry, and sent status
    const { error: updateError } = await svc
      .from('seat_invites')
      .update({
        invite_token: newToken,
        expires_at: newExpiry,
        status: 'sent',
        updated_at: new Date().toISOString()
      })
      .eq('id', invite_id);

    if (updateError) {
      return NextResponse.json({ 
        ok: false, 
        error: 'update_failed',
        message: updateError.message 
      }, { status: 500 });
    }

    // Log the resend action for audit purposes
    try {
      await svc.from('audit_log').insert({
        actor_id: user.id,
        action: 'invitation_resent',
        metadata: {
          invite_id,
          email: invitation.email,
          course_id: invitation.course_id,
          previous_status: invitation.status,
          new_token: newToken,
          expires_at: newExpiry
        }
      });
    } catch (auditError) {
      console.error('Failed to log invitation resend:', auditError);
      // Don't fail the request if audit logging fails
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'Invitation resent successfully',
      details: {
        email: invitation.email,
        new_expiry: newExpiry,
        claim_url: claimUrl
      }
    });

  } catch (error) {
    console.error('Invitation resend error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'internal_server_error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
