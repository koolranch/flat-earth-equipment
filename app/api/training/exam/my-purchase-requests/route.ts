/**
 * GET /api/training/exam/my-purchase-requests
 *
 * Returns the authed user's 20 most recent purchase requests, ordered
 * by created_at desc. Only whitelisted columns are returned — no employee_email,
 * employee_user_id, message, related_*, or other sensitive fields.
 *
 * Supports both cookie-based auth (web) and Bearer-token auth (Expo mobile).
 *
 * Response shapes:
 *   200  { ok: true, requests: Array<{ id, employer_name, employer_email, status, created_at, resolved_at }> }
 *   401  { ok: false, errorCode: 'unauthorized' }
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/mobile-auth';
import { supabaseService } from '@/lib/supabase/service.server';

export async function GET(req: NextRequest) {
  // ── 1. Authenticate ──────────────────────────────────────────────────────
  const { user } = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ ok: false, errorCode: 'unauthorized' }, { status: 401 });
  }

  // ── 2. Fetch most recent 20 rows, whitelisted columns only ───────────────
  const svc = supabaseService();

  const { data, error } = await svc
    .from('purchase_requests')
    .select('id, employer_name, employer_email, status, created_at, resolved_at')
    .eq('employee_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('[my-purchase-requests] DB error:', error);
    return NextResponse.json(
      { ok: false, errorCode: 'internal', error: 'Could not load requests.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, requests: data ?? [] });
}
