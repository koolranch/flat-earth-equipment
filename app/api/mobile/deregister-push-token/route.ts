/**
 * POST /api/mobile/deregister-push-token
 *
 * Removes an Expo push token for the authenticated user.
 * Always returns 200 — idempotent even if the token was never registered.
 * Supports both cookie-based auth (web) and Bearer-token auth (Expo mobile).
 *
 * Response shapes:
 *   200  { ok: true }
 *   400  { ok: false, reason: 'invalid_body' }
 *   401  { ok: false, reason: 'unauthorized' }
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/mobile-auth';
import { supabaseService } from '@/lib/supabase/service.server';

export async function POST(req: NextRequest) {
  // ── 1. Authenticate ──────────────────────────────────────────────────────────
  const { user } = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });
  }

  // ── 2. Parse + validate body ─────────────────────────────────────────────────
  let token: unknown;
  try {
    const body = await req.json();
    token = body?.token;
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid_body' }, { status: 400 });
  }

  if (typeof token !== 'string' || !token) {
    return NextResponse.json({ ok: false, reason: 'invalid_body' }, { status: 400 });
  }

  // ── 3. Delete (idempotent — no error if row doesn't exist) ───────────────────
  const svc = supabaseService();
  const { error } = await svc
    .from('push_tokens')
    .delete()
    .eq('user_id', user.id)
    .eq('token', token);

  if (error) {
    console.error('[push] deregister-push-token DB error:', error);
    // Still return 200 — a failed delete should not break the mobile app logout flow
  }

  return NextResponse.json({ ok: true });
}
