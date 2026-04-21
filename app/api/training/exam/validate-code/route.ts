/**
 * POST /api/training/exam/validate-code
 *
 * Mobile-app endpoint: validates an employer-issued seat invite code, then
 * atomically claims the seat and grants exam access if the code is valid.
 *
 * Supports both cookie-based auth (web) and Bearer-token auth (Expo mobile).
 *
 * Response shapes:
 *
 *   200  { valid: true,  orgName: string|null, claimedSeatInviteId: uuid }
 *   200  { valid: false, errorCode: string, error: string }
 *   401  { valid: false, errorCode: 'unauthorized', error: string }
 *   429  { valid: false, errorCode: 'rate_limited', error: string }
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getAuthUser } from '@/lib/supabase/mobile-auth';
import { supabaseService } from '@/lib/supabase/service.server';
import { rateLimit } from '@/lib/ratelimit';
import { selectClaimableOrder } from '@/lib/training/orderEntitlements';
import {
  normalizeCode,
  checkInvite,
  isIdempotentReclaim,
  type InviteRow,
} from '@/lib/training/validateInviteCode';

// ─── Rate-limit constants ────────────────────────────────────────────────────
const RL_MAX = 10;
const RL_WINDOW_SEC = 600; // 10 minutes

// ─── Route handler ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── 1. Authenticate (cookie or Bearer token) ──────────────────────────────
  const { user } = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { valid: false, errorCode: 'unauthorized', error: 'Authentication required.' },
      { status: 401 },
    );
  }

  // ── 2. Rate-limit by client IP ────────────────────────────────────────────
  const headersList = headers();
  const fwdFor = headersList.get('x-forwarded-for');
  const clientIp = fwdFor
    ? fwdFor.split(',')[0].trim()
    : (headersList.get('x-real-ip') ?? '127.0.0.1');

  const rl = await rateLimit(`validate-code:${clientIp}`, RL_MAX, RL_WINDOW_SEC);
  if (!rl.success) {
    return NextResponse.json(
      {
        valid: false,
        errorCode: 'rate_limited',
        error: 'Too many attempts. Try again in a few minutes.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1_000)),
        },
      },
    );
  }

  // ── 3. Parse + normalise input ────────────────────────────────────────────
  let rawCode: string;
  try {
    const body = await req.json();
    rawCode = typeof body?.code === 'string' ? body.code : '';
  } catch {
    rawCode = '';
  }

  const code = normalizeCode(rawCode);
  if (!code) {
    return NextResponse.json(
      { valid: false, errorCode: 'not_found', error: 'Invalid code.' },
      { status: 200 },
    );
  }

  // ── 4. Look up invite by token (case-insensitive) ─────────────────────────
  const svc = supabaseService();

  const { data: invite, error: lookupErr } = await svc
    .from('seat_invites')
    .select('id, status, claimed_at, claimed_by, expires_at, email, course_id, order_id, created_by')
    .ilike('invite_token', code)
    .maybeSingle();

  if (lookupErr) {
    console.error('[validate-code] DB lookup error:', lookupErr);
    return NextResponse.json(
      { valid: false, errorCode: 'internal', error: 'Database error.' },
      { status: 500 },
    );
  }

  if (!invite) {
    return NextResponse.json(
      { valid: false, errorCode: 'not_found', error: 'Invalid code.' },
      { status: 200 },
    );
  }

  const inv = invite as InviteRow;

  // ── 5. Validate invite (pure checks) ─────────────────────────────────────
  const userEmail = user.email ?? '';
  const validationError = checkInvite(inv, user.id, userEmail);

  if (validationError) {
    return NextResponse.json(validationError, { status: 200 });
  }

  // ── 6. Idempotency: already claimed by this exact user ───────────────────
  if (isIdempotentReclaim(inv, user.id)) {
    const orgName = await resolveOrgName(svc, inv.created_by);
    return NextResponse.json({ valid: true, orgName, claimedSeatInviteId: inv.id });
  }

  // ── 7. Find a claimable order ─────────────────────────────────────────────
  //
  // Prefer invite.order_id (set on newer invites via bulk-invite flow).
  // Fall back to querying trainer's orders (older assign-seats flow).
  let claimOrderId: string | null = null;

  const ordersQuery = svc
    .from('orders')
    .select(
      'id, user_id, course_id, seats, created_at, is_unlimited, subscription_status, current_period_end, ended_at',
    )
    .eq('course_id', inv.course_id)
    .order('created_at', { ascending: false });

  const { data: candidateOrders, error: ordersErr } = inv.order_id
    ? await ordersQuery.eq('id', inv.order_id)
    : await ordersQuery.eq('user_id', inv.created_by);

  if (ordersErr) {
    console.error('[validate-code] Orders query error:', ordersErr);
    return NextResponse.json(
      { valid: false, errorCode: 'internal', error: 'Could not verify seat availability.' },
      { status: 500 },
    );
  }

  const orderIds = (candidateOrders ?? []).map((o: any) => o.id);
  let claimedByOrderId: Record<string, number> = {};

  if (orderIds.length > 0) {
    const { data: claims } = await svc
      .from('seat_claims')
      .select('order_id')
      .in('order_id', orderIds);

    for (const c of claims ?? []) {
      const oid = (c as any).order_id;
      claimedByOrderId[oid] = (claimedByOrderId[oid] ?? 0) + 1;
    }
  }

  const selected = selectClaimableOrder((candidateOrders ?? []) as any[], claimedByOrderId);
  if (!selected) {
    return NextResponse.json(
      {
        valid: false,
        errorCode: 'no_seats_available',
        error: 'No seats are available on this code. Contact your employer.',
      },
      { status: 200 },
    );
  }

  claimOrderId = selected.order.id;

  // ── 8a. Ensure enrollment exists (exam-access side effect) ────────────────
  //
  // This is the EXACT same write as app/api/claim/accept/route.ts and the
  // Stripe webhook.  Having an enrollment row is what makes
  // GET /api/training/progress return data (instead of 404), which the mobile
  // app's fetchExamStatus uses to determine purchased=true.
  const { data: existingEnrollment } = await svc
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', inv.course_id)
    .maybeSingle();

  if (!existingEnrollment) {
    const { error: enrollErr } = await svc.from('enrollments').insert({
      user_id: user.id,
      course_id: inv.course_id,
      progress_pct: 0,
      passed: false,
      created_at: new Date().toISOString(),
    });

    if (enrollErr) {
      console.error('[validate-code] Enrollment insert error:', enrollErr);
      return NextResponse.json(
        { valid: false, errorCode: 'internal', error: 'Could not grant exam access.' },
        { status: 500 },
      );
    }
  }

  // ── 8b. Upsert seat_claims row ────────────────────────────────────────────
  //
  // Matches the conflict-target used by app/api/claim/accept/route.ts exactly.
  try {
    await svc
      .from('seat_claims')
      .upsert(
        { order_id: claimOrderId, user_id: user.id, created_at: new Date().toISOString() },
        { onConflict: 'order_id,user_id', ignoreDuplicates: false },
      );
  } catch (e) {
    console.error('[validate-code] seat_claims upsert failed (non-fatal):', e);
  }

  // ── 8c. Mark invite as claimed ────────────────────────────────────────────
  //
  // Status 'claimed' + claimed_at + claimed_by — identical to app/api/claim/accept/route.ts.
  const { error: claimErr } = await svc
    .from('seat_invites')
    .update({
      status: 'claimed',
      claimed_at: new Date().toISOString(),
      claimed_by: user.id,
    })
    .eq('id', inv.id);

  if (claimErr) {
    console.error('[validate-code] seat_invites update error:', claimErr);
    return NextResponse.json(
      { valid: false, errorCode: 'internal', error: 'Could not mark code as used.' },
      { status: 500 },
    );
  }

  // ── 9. Resolve org name (best-effort) ─────────────────────────────────────
  const orgName = await resolveOrgName(svc, inv.created_by);

  return NextResponse.json({
    valid: true,
    orgName,
    claimedSeatInviteId: inv.id,
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Look up the org name for a trainer user.
 *
 * seat_invites has no org_id column, so we join via org_members.
 * Returns null if the trainer is not an org member (individual trainer).
 */
async function resolveOrgName(
  svc: ReturnType<typeof supabaseService>,
  trainerUserId: string,
): Promise<string | null> {
  try {
    const { data } = await svc
      .from('org_members')
      .select('orgs(name)')
      .eq('user_id', trainerUserId)
      .in('role', ['owner', 'trainer'])
      .limit(1)
      .maybeSingle();

    if (!data) return null;
    const orgs = (data as any).orgs;
    return Array.isArray(orgs) ? (orgs[0]?.name ?? null) : (orgs?.name ?? null);
  } catch {
    return null;
  }
}
