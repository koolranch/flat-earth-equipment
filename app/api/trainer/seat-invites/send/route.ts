import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { sendInviteEmail } from '@/lib/email/resend';

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
  
  // Role authorization check
  const { data: prof } = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!prof || !['trainer', 'admin'].includes(prof.role)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  // Parse request body
  const { course_id } = await req.json();
  if (!course_id) {
    return NextResponse.json({ ok: false, error: 'missing_course_id' }, { status: 400 });
  }

  // Fetch pending invites created by this trainer for this course
  const { data: pending, error } = await svc
    .from('seat_invites')
    .select('id, email, created_at')
    .eq('created_by', user.id)
    .eq('course_id', course_id)
    .eq('status', 'pending');
    
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  if (!pending || pending.length === 0) {
    return NextResponse.json({ 
      ok: true, 
      sent: 0, 
      total: 0, 
      message: 'No pending invites found for this course' 
    });
  }

  // Get course details for email content
  const { data: course } = await svc.from('courses').select('title').eq('id', course_id).maybeSingle();
  const courseTitle = course?.title || 'Forklift Operator Training';

  // Base URL for claim links
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  let sent = 0;
  let failed = 0;
  const updates: any[] = [];
  const errors: any[] = [];

  // Process each pending invite
  for (const inv of pending) {
    try {
      // Generate secure random token
      const token = randomBytes(24).toString('base64url');
      
      // Set expiry to 14 days from now
      const expires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      
      // Generate claim URL
      const claimUrl = `${base}/claim/${token}`;

      // Send email invitation
      const emailResult = await sendInviteEmail({
        to: inv.email,
        claimUrl,
        courseTitle
      });

      // If email sent successfully, prepare update
      if (emailResult) {
        updates.push({
          id: inv.id,
          invite_token: token,
          expires_at: expires,
          status: 'sent',
          sent_at: new Date().toISOString()
        });
        sent++;
      }

    } catch (emailError: any) {
      console.error(`Failed to send invite to ${inv.email}:`, emailError);
      failed++;
      errors.push({
        email: inv.email,
        error: emailError.message || 'Email delivery failed'
      });
      
      // Still update the invite with token but mark as failed
      const token = randomBytes(24).toString('base64url');
      const expires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      
      updates.push({
        id: inv.id,
        invite_token: token,
        expires_at: expires,
        status: 'failed',
        sent_at: new Date().toISOString()
      });
    }
  }

  // Batch update all invite records
  if (updates.length > 0) {
    try {
      const { error: updateError } = await svc
        .from('seat_invites')
        .upsert(updates, { onConflict: 'id' });
        
      if (updateError) {
        console.error('Error updating seat invites:', updateError);
        return NextResponse.json({ 
          ok: false, 
          error: 'failed_to_update_invites' 
        }, { status: 500 });
      }
    } catch (updateError) {
      console.error('Unexpected error updating invites:', updateError);
      return NextResponse.json({ 
        ok: false, 
        error: 'database_update_failed' 
      }, { status: 500 });
    }
  }

  // Log audit trail
  try {
    await svc.from('audit_log').insert({
      actor_id: user.id,
      action: 'seat_invites_sent',
      metadata: {
        course_id,
        course_title: courseTitle,
        total_pending: pending.length,
        sent_count: sent,
        failed_count: failed,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (auditError) {
    console.error('Error logging invite send audit:', auditError);
    // Don't fail the request if audit logging fails
  }

  return NextResponse.json({
    ok: true,
    sent,
    failed,
    total: pending.length,
    course_title: courseTitle,
    summary: {
      pending_processed: pending.length,
      emails_sent: sent,
      emails_failed: failed,
      success_rate: pending.length > 0 ? Math.round((sent / pending.length) * 100) : 0
    },
    errors: errors.length > 0 ? errors : undefined
  });
}
