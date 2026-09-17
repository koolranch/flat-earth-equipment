import 'server-only';
import Stripe from 'stripe';
import { NextResponse, type NextRequest } from 'next/server';
import { PARTS_WATCH_PATH, partsWatchStatus } from './passwordGate';
import { supabaseService } from '../supabase/service.server';

/**
 * Shared plumbing for the dashboard's mutation routes. Every write route must pass three
 * checks before it touches Stripe or Supabase:
 *
 *   1. the password-gate cookie is valid (same check the page uses),
 *   2. the request is same-origin — a plain form post from another site is rejected even
 *      if the browser attached our cookie,
 *   3. the target SKU still passes the operation's eligibility gate server-side; buttons in
 *      the UI are hints, never authority.
 *
 * Results come back as a one-line banner on the dashboard via the `m` / `k` query params
 * (message + kind), so the flow stays a plain form post + 303 with no client JS.
 */

export type BannerKind = 'ok' | 'warn' | 'error';

export function redirectWithBanner(request: NextRequest, kind: BannerKind, message: string) {
  const target = new URL(PARTS_WATCH_PATH, request.nextUrl.origin);
  target.searchParams.set('k', kind);
  target.searchParams.set('m', message.slice(0, 300));
  return NextResponse.redirect(target, { status: 303 });
}

/**
 * Returns a redirect response when the request must be refused, or null when it may proceed.
 * Refusals never leak whether the SKU exists.
 */
export function refuseUnlessAllowed(request: NextRequest): NextResponse | null {
  if (partsWatchStatus() !== 'unlocked') {
    return NextResponse.redirect(new URL(PARTS_WATCH_PATH, request.nextUrl.origin), { status: 303 });
  }

  const origin = request.headers.get('origin');
  const expected = request.nextUrl.origin;
  // Browsers always send Origin on cross-site POSTs; a missing header on a same-site form post
  // is possible only from very old clients, so treat absent as a refusal too.
  if (!origin || origin !== expected) {
    return redirectWithBanner(request, 'error', 'Request refused: cross-origin.');
  }

  return null;
}

/** SKUs are catalog identifiers like `333D1629` or `RT-T190-400X86X49-C`; nothing else gets through. */
export function readSku(form: FormData): string | null {
  const raw = String(form.get('sku') ?? '').trim();
  return /^[A-Za-z0-9][A-Za-z0-9._\/-]{0,63}$/.test(raw) ? raw : null;
}

export function stripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY missing');
  return new Stripe(key);
}

/** Service-role client, exposed here so the action routes stay inside the server-only lint boundary. */
export function opsSupabase() {
  return supabaseService();
}
