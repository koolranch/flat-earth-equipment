/**
 * POST /api/mobile/register-push-token
 *
 * Registers (or refreshes) an Expo push token for the authenticated user.
 * Supports both cookie-based auth (web) and Bearer-token auth (Expo mobile).
 *
 * Response shapes:
 *   200  { ok: true }
 *   400  { ok: false, reason: 'invalid_body' | 'invalid_token' }
 *   401  { ok: false, reason: 'unauthorized' }
 *   500  { ok: false, reason: 'db_error' }
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/mobile-auth';
import { supabaseService } from '@/lib/supabase/service.server';

const VALID_PLATFORMS = new Set(['ios', 'android', 'web']);

export async function POST(req: NextRequest) {
  // ── 1. Authenticate ──────────────────────────────────────────────────────────
  const { user } = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });
  }

  // ── 2. Parse + validate body ─────────────────────────────────────────────────
  let token: unknown;
  let platform: unknown;
  try {
    const body = await req.json();
    token = body?.token;
    platform = body?.platform;
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid_body' }, { status: 400 });
  }

  if (typeof token !== 'string' || !token || !VALID_PLATFORMS.has(platform as string)) {
    return NextResponse.json({ ok: false, reason: 'invalid_body' }, { status: 400 });
  }

  // ── 3. Validate Expo token format ────────────────────────────────────────────
  if (!token.startsWith('ExponentPushToken[') || !token.endsWith(']')) {
    return NextResponse.json({ ok: false, reason: 'invalid_token' }, { status: 400 });
  }

  // ── 4. Upsert (conflict on user_id + token; refresh updated_at + platform) ──
  const svc = supabaseService();
  const { error } = await svc.from('push_tokens').upsert(
    {
      user_id: user.id,
      token,
      platform: platform as string,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,token' },
  );

  if (error) {
    console.error('[push] register-push-token DB error:', error);
    return NextResponse.json({ ok: false, reason: 'db_error' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
