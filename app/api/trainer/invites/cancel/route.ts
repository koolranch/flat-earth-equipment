import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

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
    // Fetch invitation details to verify ownership and get info for audit
    const { data: invitation, error: inviteError } = await svc
      .from('seat_invites')
      .select('id, email, course_id, status')
      .eq('id', invite_id)
      .eq('created_by', user.id)
      .maybeSingle();

    if (inviteError || !invitation) {
      return NextResponse.json({ ok: false, error: 'invitation_not_found' }, { status: 404 });
    }

    // Check if invitation can be cancelled
    if (invitation.status === 'claimed') {
      return NextResponse.json({ 
        ok: false, 
        error: 'already_claimed',
        message: 'Cannot cancel an invitation that has already been claimed.'
      }, { status: 400 });
    }

    if (invitation.status === 'cancelled') {
      return NextResponse.json({ 
        ok: false, 
        error: 'already_cancelled',
        message: 'This invitation is already cancelled.'
      }, { status: 400 });
    }

    // Update invitation status to cancelled
    const { error: updateError } = await svc
      .from('seat_invites')
      .update({
        status: 'cancelled',
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

    // Log the cancellation action for audit purposes
    try {
      await svc.from('audit_log').insert({
        actor_id: user.id,
        action: 'invitation_cancelled',
        metadata: {
          invite_id,
          email: invitation.email,
          course_id: invitation.course_id,
          previous_status: invitation.status,
          cancelled_at: new Date().toISOString()
        }
      });
    } catch (auditError) {
      console.error('Failed to log invitation cancellation:', auditError);
      // Don't fail the request if audit logging fails
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'Invitation cancelled successfully',
      details: {
        invite_id,
        email: invitation.email,
        previous_status: invitation.status
      }
    });

  } catch (error) {
    console.error('Invitation cancellation error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'internal_server_error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
