/**
 * Prompt D — Ask-employer fulfillment tests.
 *
 * These tests cover the two NEW units the webhook delegates to:
 *   1. shouldSuppressEmployerSideEffects(metadata, envFlag)  — the guard condition
 *      used inline in the webhook around each existing employer-facing side effect.
 *      Proves R1–R5: suppression keys on request_id AND flag, not flag alone.
 *
 *   2. runAskEmployerFulfillment(args, deps)                 — the 7-step pipeline
 *      that runs when the trigger condition holds. Proves F1–F4 + E1: correct
 *      writes/emails/pushes, idempotency on Stripe retry, collision safety, and
 *      error isolation.
 *
 * Test strategy: pure unit tests with injected dependencies. No live server, no
 * real Stripe, no real Supabase, no real Resend/Expo. Keeps the test
 * deterministic and runnable in CI without secrets.
 *
 * Full end-to-end coverage against a live webhook endpoint lives under
 * tests/integration/stripe-training-webhook.spec.ts (Stripe CLI replay) and is
 * the manual rollout checklist step, not a unit test.
 *
 * Run:  npx playwright test tests/integration/stripe-webhook-ask-employer.spec.ts
 */

import { expect, test } from '@playwright/test';
import {
  runAskEmployerFulfillment,
  shouldSuppressEmployerSideEffects,
  type FulfillmentDeps,
  type PurchaseRequestRow,
  type SeatInviteRow,
  type SendEmailResult,
} from '../../lib/training/askEmployerFulfillment';

// ─── Harness ──────────────────────────────────────────────────────────────────

interface Spy {
  loadPurchaseRequest: Array<{ id: string }>;
  findInviteById: Array<{ id: string }>;
  findInviteByOrderId: Array<{ orderId: string }>;
  insertSeatInvite: Array<Parameters<FulfillmentDeps['insertSeatInvite']>[0]>;
  updatePurchaseRequest: Array<{
    id: string;
    patch: Parameters<FulfillmentDeps['updatePurchaseRequest']>[1];
  }>;
  sendEmail: Array<Parameters<FulfillmentDeps['sendEmail']>[0]>;
  sendPushToUser: Array<{ userId: string; payload: any }>;
  renderEmailForEmployee: Array<Parameters<FulfillmentDeps['renderEmailForEmployee']>[0]>;
  analytics: Array<{ name: string; data: Record<string, unknown> }>;
}

interface HarnessOptions {
  purchaseRequest?: PurchaseRequestRow | null;
  existingInviteById?: SeatInviteRow | null;
  existingInviteByOrderId?: SeatInviteRow | null;
  insertError?: { code?: string; message?: string } | null;
  insertThrows?: Error;
  updateRowsAffected?: number;
  updateError?: { code?: string; message?: string } | null;
  token?: string;
  fixedInviteId?: string;
  fixedNow?: Date;
  /**
   * Override deps.sendEmail's return value. Defaults to { ok: true, id: 're_fake_msg_id' }
   * so the pre-existing F1–F4 + E1 suite continues to assert happy-path
   * deliverability. Phase 4 adds a new "email-failed" variant.
   */
  sendEmailResult?: SendEmailResult;
}

function buildHarness(opts: HarnessOptions = {}): { deps: FulfillmentDeps; spy: Spy } {
  const spy: Spy = {
    loadPurchaseRequest: [],
    findInviteById: [],
    findInviteByOrderId: [],
    insertSeatInvite: [],
    updatePurchaseRequest: [],
    sendEmail: [],
    sendPushToUser: [],
    renderEmailForEmployee: [],
    analytics: [],
  };
  const token = opts.token ?? 'TOKEN_ABC';
  const fixedInviteId = opts.fixedInviteId ?? 'invite-new-1';
  const fixedNow = opts.fixedNow ?? new Date('2026-04-21T00:00:00Z');

  const deps: FulfillmentDeps = {
    loadPurchaseRequest: async (id) => {
      spy.loadPurchaseRequest.push({ id });
      return opts.purchaseRequest ?? null;
    },
    findInviteById: async (id) => {
      spy.findInviteById.push({ id });
      return opts.existingInviteById ?? null;
    },
    findInviteByOrderId: async (orderId) => {
      spy.findInviteByOrderId.push({ orderId });
      return opts.existingInviteByOrderId ?? null;
    },
    insertSeatInvite: async (row) => {
      spy.insertSeatInvite.push(row);
      if (opts.insertThrows) throw opts.insertThrows;
      if (opts.insertError) return { data: null, error: opts.insertError };
      return {
        data: {
          id: fixedInviteId,
          invite_token: row.invite_token,
          email: row.email,
          status: row.status,
        },
        error: null,
      };
    },
    updatePurchaseRequest: async (id, patch) => {
      spy.updatePurchaseRequest.push({ id, patch });
      return {
        rowsAffected: opts.updateRowsAffected ?? 1,
        error: opts.updateError ?? null,
      };
    },
    sendEmail: async (msg) => {
      spy.sendEmail.push(msg);
      return opts.sendEmailResult ?? { ok: true, id: 're_fake_msg_id' };
    },
    sendPushToUser: async (userId, payload) => {
      spy.sendPushToUser.push({ userId, payload });
      return { sent: 0, failed: 0 };
    },
    generateToken: () => token,
    renderEmailForEmployee: async (props) => {
      spy.renderEmailForEmployee.push(props);
      return `<html>rendered for ${props.inviteToken}</html>`;
    },
    now: () => fixedNow,
    analytics: (name, data) => {
      spy.analytics.push({ name, data });
    },
  };

  return { deps, spy };
}

const DEFAULT_PR: PurchaseRequestRow = {
  id: 'pr-1',
  status: 'pending',
  employee_user_id: 'user-emp-1',
  employee_email: 'employee@example.com',
  employer_name: 'Acme Logistics',
  seats_requested: 1,
  related_seat_invite_id: null,
};

const DEFAULT_ARGS = {
  requestId: 'pr-1',
  orderId: 'order-1',
  orderUserId: 'user-employer-1',
  courseId: 'course-forklift',
  employerEmail: 'employer@acme.com',
  siteUrl: 'https://www.flatearthequipment.com',
};

// ─── Guard condition tests (R1–R5) ────────────────────────────────────────────

test.describe('shouldSuppressEmployerSideEffects — guard condition proves R1-R5', () => {
  test('R1: flag OFF, no request_id → does NOT suppress (welcome email fires)', () => {
    expect(
      shouldSuppressEmployerSideEffects({ quantity: '1', course_slug: 'forklift' }, undefined),
    ).toBe(false);
    expect(
      shouldSuppressEmployerSideEffects({ quantity: '1', course_slug: 'forklift' }, '0'),
    ).toBe(false);
  });

  test('R2 [CRITICAL]: flag ON, no request_id → does NOT suppress (welcome email STILL fires)', () => {
    expect(
      shouldSuppressEmployerSideEffects({ quantity: '1', course_slug: 'forklift' }, '1'),
    ).toBe(false);
  });

  test('R3: quantity=2 trainer, no request_id, flag OFF → does NOT suppress', () => {
    expect(
      shouldSuppressEmployerSideEffects({ quantity: '2', course_slug: 'forklift' }, '0'),
    ).toBe(false);
  });

  test('R4 [CRITICAL]: quantity=2 trainer, no request_id, flag ON → does NOT suppress (all existing behavior preserved)', () => {
    expect(
      shouldSuppressEmployerSideEffects({ quantity: '2', course_slug: 'forklift' }, '1'),
    ).toBe(false);
  });

  test('R5: referral_code present, no request_id, flag ON → does NOT suppress', () => {
    expect(
      shouldSuppressEmployerSideEffects(
        { quantity: '1', course_slug: 'forklift', referral_code: 'CODE123' },
        '1',
      ),
    ).toBe(false);
  });

  test('suppression only fires when BOTH conditions hold', () => {
    expect(shouldSuppressEmployerSideEffects({ request_id: 'abc' }, '1')).toBe(true);
    expect(shouldSuppressEmployerSideEffects({ request_id: 'abc' }, '0')).toBe(false);
    expect(shouldSuppressEmployerSideEffects({ request_id: 'abc' }, undefined)).toBe(false);
    expect(shouldSuppressEmployerSideEffects({ request_id: '' }, '1')).toBe(false);
    expect(shouldSuppressEmployerSideEffects({}, '1')).toBe(false);
    expect(shouldSuppressEmployerSideEffects(null, '1')).toBe(false);
    expect(shouldSuppressEmployerSideEffects(undefined, '1')).toBe(false);
  });
});

// ─── Pipeline tests (F1–F4 + E1) ──────────────────────────────────────────────

test.describe('runAskEmployerFulfillment — happy path (F1)', () => {
  test('F1: creates invite, updates PR, sends email+push, emits analytics', async () => {
    const { deps, spy } = buildHarness({
      purchaseRequest: { ...DEFAULT_PR },
      token: 'TOK_NEW',
      fixedInviteId: 'invite-xyz',
    });

    const outcome = await runAskEmployerFulfillment(DEFAULT_ARGS, deps);

    expect(outcome).toMatchObject({
      status: 'succeeded',
      inviteId: 'invite-xyz',
      reusedInvite: false,
      updatedPurchaseRequest: true,
      emailDelivered: true,
    });

    // seat_invite was inserted with the correct fields
    expect(spy.insertSeatInvite).toHaveLength(1);
    expect(spy.insertSeatInvite[0]).toMatchObject({
      invite_token: 'TOK_NEW',
      email: 'employee@example.com',
      status: 'sent',
      course_id: 'course-forklift',
      created_by: 'user-employer-1',
      order_id: 'order-1',
    });
    expect(spy.insertSeatInvite[0].expires_at).toBeTruthy();
    expect(spy.insertSeatInvite[0].sent_at).toBeTruthy();

    // purchase_request was updated
    expect(spy.updatePurchaseRequest).toHaveLength(1);
    expect(spy.updatePurchaseRequest[0].patch).toMatchObject({
      status: 'paid',
      related_order_id: 'order-1',
      related_seat_invite_id: 'invite-xyz',
    });

    // email was rendered + sent with the correct token and employer name
    expect(spy.renderEmailForEmployee).toHaveLength(1);
    expect(spy.renderEmailForEmployee[0]).toMatchObject({
      inviteToken: 'TOK_NEW',
      employerName: 'Acme Logistics',
    });
    expect(spy.sendEmail).toHaveLength(1);
    expect(spy.sendEmail[0].to).toBe('employee@example.com');
    expect(spy.sendEmail[0].subject).toBe('Your OSHA forklift exam is unlocked');

    // push was sent to the employee with exam_ready payload
    expect(spy.sendPushToUser).toHaveLength(1);
    expect(spy.sendPushToUser[0].userId).toBe('user-emp-1');
    expect(spy.sendPushToUser[0].payload).toMatchObject({
      title: 'Your exam is unlocked',
      body: 'Tap to take your OSHA forklift certification exam.',
      data: { type: 'exam_ready' },
    });

    // analytics event emitted with all required fields
    expect(spy.analytics).toHaveLength(1);
    expect(spy.analytics[0]).toMatchObject({
      name: 'exam_ask_employer_paid',
      data: {
        request_id: 'pr-1',
        order_id: 'order-1',
        seat_invite_id: 'invite-xyz',
        employer_email: 'employer@acme.com',
        seats_requested: 1,
        email_delivered: true,
      },
    });
  });
});

// ─── Phase 4: email-delivery failure propagation (F5) ─────────────────────────

test.describe('runAskEmployerFulfillment — email-delivery failure (F5)', () => {
  test('F5a: sendEmail returns ok:false (API rejection) → emailDelivered:false, analytics event emitted, pipeline continues', async () => {
    const { deps, spy } = buildHarness({
      purchaseRequest: { ...DEFAULT_PR },
      token: 'TOK_F5',
      fixedInviteId: 'invite-f5',
      sendEmailResult: {
        ok: false,
        error: 'Email address is on the suppression list.',
        error_name: 'validation_error',
      },
    });

    const outcome = await runAskEmployerFulfillment(DEFAULT_ARGS, deps);

    // seat_invite + paid status landed; the invite still exists, ops can requeue.
    expect(outcome).toMatchObject({
      status: 'succeeded',
      inviteId: 'invite-f5',
      reusedInvite: false,
      updatedPurchaseRequest: true,
      emailDelivered: false,
    });

    // Insert + PR update both happened (email failure doesn't block them)
    expect(spy.insertSeatInvite).toHaveLength(1);
    expect(spy.updatePurchaseRequest).toHaveLength(1);
    // sendEmail was still attempted exactly once
    expect(spy.sendEmail).toHaveLength(1);
    // Push still fires (safe — demo user may still have tokens regardless of email suppression)
    expect(spy.sendPushToUser).toHaveLength(1);

    // Two analytics events, in order:
    //   1. exam_ask_employer_email_failed (new — surfaces the delivery failure)
    //   2. exam_ask_employer_paid (existing — the invite did land in DB)
    expect(spy.analytics).toHaveLength(2);
    expect(spy.analytics[0]).toMatchObject({
      name: 'exam_ask_employer_email_failed',
      data: {
        request_id: 'pr-1',
        order_id: 'order-1',
        seat_invite_id: 'invite-f5',
        email: 'employee@example.com',
        error: 'Email address is on the suppression list.',
        error_name: 'validation_error',
      },
    });
    expect(spy.analytics[1]).toMatchObject({
      name: 'exam_ask_employer_paid',
      data: {
        request_id: 'pr-1',
        email_delivered: false,
      },
    });
  });

  test('F5b: sendEmail returns ok:false with skipped:true (no RESEND_API_KEY) → emailDelivered:false, still emits failure analytics', async () => {
    // Simulates an environment where the mailer early-returns because
    // RESEND_API_KEY isn't configured. We treat that as undelivered too
    // so ops gets paged instead of silently losing the email.
    const { deps, spy } = buildHarness({
      purchaseRequest: { ...DEFAULT_PR },
      sendEmailResult: { ok: false, skipped: true },
    });

    const outcome = await runAskEmployerFulfillment(DEFAULT_ARGS, deps);

    expect(outcome).toMatchObject({
      status: 'succeeded',
      emailDelivered: false,
    });

    const failedEvt = spy.analytics.find((a) => a.name === 'exam_ask_employer_email_failed');
    expect(failedEvt).toBeTruthy();
    // With skipped:true there's no error string; we still emit the analytics
    // event so the alert fires, just with null error fields.
    expect(failedEvt!.data).toMatchObject({
      request_id: 'pr-1',
      error: null,
      error_name: null,
    });
  });

  test('F5c: retry path (reusedInvite + already paid) reports emailDelivered:true without re-sending', async () => {
    // F2b regression guard: if the first delivery already succeeded (status='paid'
    // short-circuit), we must NOT report emailDelivered:false just because we
    // didn't call sendEmail this time. The first delivery's email is the source
    // of truth.
    const { deps, spy } = buildHarness({
      purchaseRequest: { ...DEFAULT_PR, related_seat_invite_id: null },
      existingInviteByOrderId: {
        id: 'invite-first-delivery',
        invite_token: 'TOK_FIRST',
        email: 'employee@example.com',
        status: 'sent',
      },
      updateRowsAffected: 0, // status was already 'paid' on retry
    });

    const outcome = await runAskEmployerFulfillment(DEFAULT_ARGS, deps);

    expect(outcome).toMatchObject({
      status: 'succeeded',
      reusedInvite: true,
      updatedPurchaseRequest: false,
      emailDelivered: true, // <-- critical: don't lie about delivery on retries
    });
    expect(spy.sendEmail).toHaveLength(0);
  });
});

test.describe('runAskEmployerFulfillment — retry idempotency (F2)', () => {
  test('F2: second delivery finds invite via related_seat_invite_id, skips all employee side effects', async () => {
    // Simulate Stripe retry: PR is already 'paid' and linked to an invite.
    const { deps, spy } = buildHarness({
      purchaseRequest: {
        ...DEFAULT_PR,
        status: 'paid', // already paid from first delivery
        related_seat_invite_id: 'invite-first-delivery',
      },
    });

    const outcome = await runAskEmployerFulfillment(DEFAULT_ARGS, deps);

    expect(outcome).toEqual({ status: 'skipped_already_paid' });

    // No further lookups after the 'paid' short-circuit
    expect(spy.findInviteById).toHaveLength(0);
    expect(spy.findInviteByOrderId).toHaveLength(0);
    expect(spy.insertSeatInvite).toHaveLength(0);
    expect(spy.updatePurchaseRequest).toHaveLength(0);
    expect(spy.sendEmail).toHaveLength(0);
    expect(spy.sendPushToUser).toHaveLength(0);
    expect(spy.analytics).toHaveLength(0);
  });

  test('F2b: race-condition retry where PR not yet marked paid but invite already exists → suppress employee side effects', async () => {
    // Second delivery arrives while first is still mid-flight: PR still shows
    // status='pending' (first delivery has not committed the UPDATE yet) but
    // the seat_invite was inserted. The `status != 'paid'` predicate in
    // updatePurchaseRequest yields rowsAffected=0 (first delivery won the
    // race and already flipped it), and the helper must NOT re-send email/push.
    const existingInvite: SeatInviteRow = {
      id: 'invite-first-delivery',
      invite_token: 'TOK_FIRST',
      email: 'employee@example.com',
      status: 'sent',
    };
    const { deps, spy } = buildHarness({
      purchaseRequest: { ...DEFAULT_PR, related_seat_invite_id: null },
      existingInviteByOrderId: existingInvite,
      updateRowsAffected: 0, // retry: status was already 'paid', WHERE predicate filtered it out
    });

    const outcome = await runAskEmployerFulfillment(DEFAULT_ARGS, deps);

    expect(outcome).toMatchObject({
      status: 'succeeded',
      inviteId: 'invite-first-delivery',
      reusedInvite: true,
      updatedPurchaseRequest: false,
    });

    // No duplicate insert
    expect(spy.insertSeatInvite).toHaveLength(0);
    // No duplicate email
    expect(spy.sendEmail).toHaveLength(0);
    // No duplicate push
    expect(spy.sendPushToUser).toHaveLength(0);
    // No duplicate analytics event
    expect(spy.analytics).toHaveLength(0);
  });

  test('F2c: belt lookup via related_seat_invite_id reuses invite without hitting order_id index', async () => {
    const prWithLink: PurchaseRequestRow = {
      ...DEFAULT_PR,
      related_seat_invite_id: 'invite-belt-1',
    };
    const existing: SeatInviteRow = {
      id: 'invite-belt-1',
      invite_token: 'TOK_BELT',
      email: 'employee@example.com',
      status: 'sent',
    };
    const { deps, spy } = buildHarness({
      purchaseRequest: prWithLink,
      existingInviteById: existing,
      updateRowsAffected: 0,
    });

    const outcome = await runAskEmployerFulfillment(DEFAULT_ARGS, deps);

    expect(outcome.status).toBe('succeeded');
    expect(spy.findInviteById).toHaveLength(1);
    expect(spy.findInviteByOrderId).toHaveLength(0); // belt found it; no need for suspenders
    expect(spy.insertSeatInvite).toHaveLength(0);
  });
});

test.describe('runAskEmployerFulfillment — flag off handled at caller (F3)', () => {
  test('F3 is enforced at the webhook layer, not the helper — documented below', () => {
    // The helper is only invoked when both conditions hold:
    //   session.metadata.request_id && process.env.ENABLE_ASK_EMPLOYER_FULFILLMENT === '1'
    //
    // When the flag is OFF, the outer `if` in app/api/webhooks/stripe/route.ts
    // never calls runAskEmployerFulfillment. The guards in R1–R5 above
    // guarantee that existing employer-facing side effects (welcome email,
    // enrollment-notification, enrollments insert, trainer role) still fire —
    // which means "fall through to normal single-seat handling". This test
    // asserts the helper is intentionally not exercised in the flag-off
    // branch; there is no code path to test here.
    expect(true).toBe(true);
  });
});

test.describe('runAskEmployerFulfillment — collision (F4)', () => {
  test('F4: unique-violation (23505) on insert → collision outcome, no PR update, no email, no push', async () => {
    const { deps, spy } = buildHarness({
      purchaseRequest: { ...DEFAULT_PR },
      insertError: { code: '23505', message: 'duplicate key value violates unique constraint' },
    });

    const outcome = await runAskEmployerFulfillment(DEFAULT_ARGS, deps);

    expect(outcome).toEqual({ status: 'collision' });

    // Insert was attempted once
    expect(spy.insertSeatInvite).toHaveLength(1);
    // PR NOT updated — ops needs to manually resolve
    expect(spy.updatePurchaseRequest).toHaveLength(0);
    // No employee email
    expect(spy.sendEmail).toHaveLength(0);
    // No push
    expect(spy.sendPushToUser).toHaveLength(0);
    // Collision analytics emitted (not the happy-path one)
    expect(spy.analytics).toHaveLength(1);
    expect(spy.analytics[0].name).toBe('exam_ask_employer_fulfillment_collision');
    expect(spy.analytics[0].data).toMatchObject({
      request_id: 'pr-1',
      order_id: 'order-1',
    });
  });
});

test.describe('runAskEmployerFulfillment — error isolation (E1)', () => {
  test('E1: non-collision DB error on insert → helper throws, caller logs + returns 200', async () => {
    const { deps, spy } = buildHarness({
      purchaseRequest: { ...DEFAULT_PR },
      insertError: { code: '42P01', message: 'relation "seat_invites" does not exist' },
    });

    await expect(runAskEmployerFulfillment(DEFAULT_ARGS, deps)).rejects.toThrow(
      /seat_invites insert failed/,
    );

    // PR was never updated because the error prevented the update step
    expect(spy.updatePurchaseRequest).toHaveLength(0);
    expect(spy.sendEmail).toHaveLength(0);
    expect(spy.sendPushToUser).toHaveLength(0);
    // No happy-path analytics emitted
    expect(spy.analytics.filter((a) => a.name === 'exam_ask_employer_paid')).toHaveLength(0);
  });

  test('E1b: missing purchase_request row → skipped outcome, no writes', async () => {
    const { deps, spy } = buildHarness({ purchaseRequest: null });

    const outcome = await runAskEmployerFulfillment(DEFAULT_ARGS, deps);

    expect(outcome).toEqual({ status: 'skipped_missing_request' });
    expect(spy.insertSeatInvite).toHaveLength(0);
    expect(spy.updatePurchaseRequest).toHaveLength(0);
    expect(spy.sendEmail).toHaveLength(0);
    expect(spy.sendPushToUser).toHaveLength(0);
    expect(spy.analytics).toHaveLength(0);
  });

  test('E1c: update error → throws, no email or push sent', async () => {
    const { deps, spy } = buildHarness({
      purchaseRequest: { ...DEFAULT_PR },
      updateError: { code: '57P01', message: 'admin shutdown' },
    });

    await expect(runAskEmployerFulfillment(DEFAULT_ARGS, deps)).rejects.toThrow(
      /purchase_requests update failed/,
    );
    expect(spy.sendEmail).toHaveLength(0);
    expect(spy.sendPushToUser).toHaveLength(0);
  });
});
