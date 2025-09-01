import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const course_id = url.searchParams.get('course_id') || '';
  
  if (!course_id) {
    return NextResponse.json({ ok: false, error: 'missing_course_id' }, { status: 400 });
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
    // Fetch seat invites created by this trainer for the specified course
    const { data: invites, error: inviteError } = await svc
      .from('seat_invites')
      .select('id, email, status, invite_token, expires_at, claimed_by, claimed_at, note, created_at')
      .eq('created_by', user.id)
      .eq('course_id', course_id)
      .order('created_at', { ascending: false });

    if (inviteError) {
      return NextResponse.json({ 
        ok: false, 
        error: inviteError.message 
      }, { status: 500 });
    }

    // Calculate status counts for dashboard analytics
    const statusCounts: Record<string, number> = {
      pending: 0,
      sent: 0,
      claimed: 0,
      expired: 0,
      cancelled: 0
    };

    const now = new Date();
    const processedInvites = (invites || []).map(invite => {
      // Check if invite is expired
      const isExpired = invite.expires_at && new Date(invite.expires_at) < now;
      const effectiveStatus = isExpired && invite.status !== 'claimed' ? 'expired' : invite.status;
      
      // Update counts
      statusCounts[effectiveStatus] = (statusCounts[effectiveStatus] || 0) + 1;

      return {
        id: invite.id,
        email: invite.email,
        status: effectiveStatus,
        invite_token: invite.invite_token,
        expires_at: invite.expires_at,
        claimed_by: invite.claimed_by,
        claimed_at: invite.claimed_at,
        note: invite.note,
        created_at: invite.created_at,
        is_expired: isExpired
      };
    });

    // Calculate summary statistics
    const totalInvites = processedInvites.length;
    const activeInvites = processedInvites.filter(inv => 
      inv.status === 'pending' || inv.status === 'sent'
    ).length;
    const successfulClaims = statusCounts.claimed;
    const claimRate = totalInvites > 0 ? Math.round((successfulClaims / totalInvites) * 100) : 0;

    return NextResponse.json({
      ok: true,
      course_id,
      total_count: totalInvites,
      active_invites: activeInvites,
      claim_rate: claimRate,
      status_counts: statusCounts,
      invites: processedInvites,
      summary: {
        total_invites: totalInvites,
        pending: statusCounts.pending,
        sent: statusCounts.sent,
        claimed: statusCounts.claimed,
        expired: statusCounts.expired,
        cancelled: statusCounts.cancelled,
        claim_rate_percent: claimRate
      }
    });

  } catch (error) {
    console.error('Trainer invites API error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'internal_server_error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
