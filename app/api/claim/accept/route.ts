import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { claimSeatForUser } from '@/lib/training/claimSeat';

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
      .select('id, email, course_id, order_id, status, expires_at, claimed_at, created_by, courses(title)')
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

    const result = await claimSeatForUser(svc, {
      inv,
      userId: user.id,
      firstName,
      lastName,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      ok: true,
      enrollment_id: result.enrollmentId,
      course_id: inv.course_id,
      course_title: result.courseTitle,
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
