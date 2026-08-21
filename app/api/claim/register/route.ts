import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { claimSeatForUser } from '@/lib/training/claimSeat';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Self-serve onboarding for invited operators who don't have an account yet.
 * Possession of a valid (unclaimed, unexpired) invite token authorizes
 * creating an account for the invite's email address. The account is created
 * with the operator's chosen password, then the seat is claimed in the same
 * request. The client signs in with the same credentials afterwards.
 */
export async function POST(req: Request) {
  const svc = supabaseService();

  const { token, firstName, lastName, password } = await req.json();

  if (!token) {
    return NextResponse.json({ ok: false, error: 'missing_token' }, { status: 400 });
  }
  if (!firstName || !lastName) {
    return NextResponse.json({ ok: false, error: 'missing_name' }, { status: 400 });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ ok: false, error: 'weak_password' }, { status: 400 });
  }

  try {
    // Fetch invitation details — the token is the authorization
    const { data: inv, error: invError } = await svc
      .from('seat_invites')
      .select('id, email, course_id, order_id, status, expires_at, claimed_at, created_by, courses(title)')
      .eq('invite_token', token)
      .maybeSingle();

    if (invError || !inv) {
      return NextResponse.json({ ok: false, error: 'invalid_token' }, { status: 404 });
    }
    if (inv.expires_at && new Date(inv.expires_at) < new Date()) {
      return NextResponse.json({ ok: false, error: 'invitation_expired' }, { status: 410 });
    }
    if (inv.claimed_at) {
      return NextResponse.json({ ok: false, error: 'already_claimed' }, { status: 409 });
    }
    if (!inv.email) {
      return NextResponse.json({ ok: false, error: 'invite_missing_email' }, { status: 400 });
    }

    const fullName = `${String(firstName).trim()} ${String(lastName).trim()}`;

    const { data: created, error: createError } = await svc.auth.admin.createUser({
      email: inv.email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        created_via: 'seat_invite_claim',
      },
    });

    if (createError || !created?.user) {
      const msg = (createError?.message || '').toLowerCase();
      if (msg.includes('already') && (msg.includes('registered') || msg.includes('exists'))) {
        // Account exists for this email — they should sign in and claim normally
        return NextResponse.json({ ok: false, error: 'account_exists' }, { status: 409 });
      }
      console.error('Error creating operator account:', createError);
      return NextResponse.json({ ok: false, error: 'failed_to_create_account' }, { status: 500 });
    }

    // The on_auth_user_created trigger creates the profile row; upsert
    // defensively in case the trigger is ever removed or lags.
    try {
      await svc
        .from('profiles')
        .upsert(
          { id: created.user.id, email: inv.email, full_name: fullName },
          { onConflict: 'id' }
        );
    } catch (profileError) {
      console.error('Profile upsert failed (non-blocking):', profileError);
    }

    const result = await claimSeatForUser(svc, {
      inv,
      userId: created.user.id,
      firstName,
      lastName,
    });

    if (!result.ok) {
      // Account exists now even though the claim failed; the operator can
      // still sign in and retry the claim from the invite link.
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      ok: true,
      email: inv.email,
      enrollment_id: result.enrollmentId,
      course_title: result.courseTitle,
      brand: result.brand,
    });
  } catch (error) {
    console.error('Unexpected error in claim register:', error);
    return NextResponse.json({ ok: false, error: 'internal_server_error' }, { status: 500 });
  }
}
