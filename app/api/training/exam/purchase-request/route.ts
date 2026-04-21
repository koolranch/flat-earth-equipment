/**
 * POST /api/training/exam/purchase-request
 *
 * Mobile-app endpoint: employee asks their employer to purchase a forklift
 * certification seat on their behalf.
 *
 * Supports both cookie-based auth (web) and Bearer-token auth (Expo mobile).
 *
 * Response shapes:
 *   200  { ok: true, id: uuid }
 *   400  { ok: false, errorCode: 'invalid_body' | 'disposable_email', error: string }
 *   401  { ok: false, errorCode: 'unauthorized' }
 *   429  { ok: false, errorCode: 'already_sent_this_week' | 'daily_limit_reached', error: string }
 *   500  { ok: false, errorCode: 'internal', error: string }
 *
 * Feature flags: none (this route is always on — the feature is additive).
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { getAuthUser } from '@/lib/supabase/mobile-auth';
import { supabaseService } from '@/lib/supabase/service.server';
import { rateLimit } from '@/lib/ratelimit';
import { sendMail } from '@/lib/email/mailer';
import { renderEmailHtml } from '@/lib/email/renderEmail';
import { createRequire } from 'module';
import AskEmployerEmail from '@/emails/AskEmployerEmail';
import { isValidEmail, isDisposableDomain } from '@/lib/training/purchaseRequestValidation';

// disposable-email-domains is CJS-only; use createRequire for clean ESM interop.
const _require = createRequire(import.meta.url);
const disposableDomains: string[] = _require('disposable-email-domains');
const DISPOSABLE_SET = new Set(disposableDomains.map((d) => d.toLowerCase()));

// ─── Rate-limit constants ─────────────────────────────────────────────────────
// Per-pair: one request per employer email per user per 7 days
const RL_PAIR_MAX = 1;
const RL_PAIR_WINDOW = 604_800; // 7 days in seconds

// Per-user daily cap: 5 requests per 24 hours regardless of employer email
const RL_DAILY_MAX = 5;
const RL_DAILY_WINDOW = 86_400; // 24 hours in seconds

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── 1. Authenticate (cookie or Bearer token) ─────────────────────────────
  const { user } = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ ok: false, errorCode: 'unauthorized' }, { status: 401 });
  }

  // ── 2. Parse + validate body ─────────────────────────────────────────────
  let employerName: string;
  let employerEmail: string;
  let message: string | undefined;
  let seatsRequested: number;

  try {
    const body = await req.json();
    employerName = typeof body.employerName === 'string' ? body.employerName.trim() : '';
    employerEmail =
      typeof body.employerEmail === 'string' ? body.employerEmail.trim().toLowerCase() : '';
    message =
      typeof body.message === 'string' ? body.message.trim() || undefined : undefined;
    seatsRequested = Math.max(1, Math.min(100, Number(body.seatsRequested) || 1));
  } catch {
    return NextResponse.json(
      { ok: false, errorCode: 'invalid_body', error: 'Invalid JSON body.' },
      { status: 400 },
    );
  }

  if (!employerName || employerName.length > 120) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'invalid_body',
        error: 'employerName is required and must be 120 characters or fewer.',
      },
      { status: 400 },
    );
  }

  if (message && message.length > 280) {
    return NextResponse.json(
      { ok: false, errorCode: 'invalid_body', error: 'message must be 280 characters or fewer.' },
      { status: 400 },
    );
  }

  if (!employerEmail || !isValidEmail(employerEmail.toLowerCase())) {
    return NextResponse.json(
      { ok: false, errorCode: 'invalid_body', error: 'employerEmail must be a valid email address.' },
      { status: 400 },
    );
  }

  // ── 3. Reject disposable email domains ────────────────────────────────────
  // [guard: disposable_email — returns early without DB write]
  if (isDisposableDomain(employerEmail, DISPOSABLE_SET)) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'disposable_email',
        error: "Please use your employer's work email address.",
      },
      { status: 400 },
    );
  }

  // ── 4. Rate-limit: per-pair (user + employer email), 7-day window ─────────
  // [guard: already_sent_this_week — returns 429 without DB write]
  const pairKey = `purchase-request-pair:${user.id}:${employerEmail}`;
  const pairRl = await rateLimit(pairKey, RL_PAIR_MAX, RL_PAIR_WINDOW);
  if (!pairRl.success) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'already_sent_this_week',
        error: "You've already sent a request to this employer recently.",
      },
      { status: 429 },
    );
  }

  // ── 5. Rate-limit: per-user daily cap, 24-hour window ────────────────────
  // [guard: daily_limit_reached — returns 429 without DB write]
  const dailyKey = `purchase-request-daily:${user.id}`;
  const dailyRl = await rateLimit(dailyKey, RL_DAILY_MAX, RL_DAILY_WINDOW);
  if (!dailyRl.success) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'daily_limit_reached',
        error: "You've reached the daily limit for employer requests.",
      },
      { status: 429 },
    );
  }

  // ── 6. Insert purchase_request row ────────────────────────────────────────
  const svc = supabaseService();

  const { data: row, error: insertErr } = await svc
    .from('purchase_requests')
    .insert({
      employee_user_id: user.id,
      employee_email: user.email ?? '',
      employer_name: employerName,
      employer_email: employerEmail,
      message: message ?? null,
      seats_requested: seatsRequested,
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertErr || !row) {
    console.error('[purchase-request] DB insert error:', insertErr);
    return NextResponse.json(
      { ok: false, errorCode: 'internal', error: 'Could not save request. Please try again.' },
      { status: 500 },
    );
  }

  const requestId = row.id as string;

  // ── 7. Send branded email to employer ─────────────────────────────────────
  // [try/catch: email failure does NOT fail the endpoint — row already committed]
  try {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ??
      'https://www.flatearthequipment.com';

    const purchaseUrl =
      `${siteUrl}/safety` +
      `?request_id=${encodeURIComponent(requestId)}` +
      `&prefill_email=${encodeURIComponent(employerEmail)}` +
      `#pricing`;

    const employeeName = user.email ?? 'An employee';
    const subject = `A forklift certification request from ${employeeName}`;

    const html = await renderEmailHtml(
      React.createElement(AskEmployerEmail, {
        employeeName,
        employerName,
        message,
        purchaseUrl,
      }),
    );

    await sendMail({ to: employerEmail, subject, html });
  } catch (emailErr) {
    // [try/catch: email error logged, endpoint still returns 200]
    console.error('[purchase-request] sendMail error (non-fatal):', emailErr);
  }

  return NextResponse.json({ ok: true, id: requestId });
}
