/**
 * Integration tests for POST /api/training/exam/validate-code
 *
 * Test strategy
 * ─────────────
 * Requirements 1-7 (validation logic, normalization, error branches, idempotency)
 * are tested via the pure helpers imported from lib/training/validateInviteCode.ts.
 * These tests run with the Playwright runner but require NO live server.
 *
 * Requirements that involve real HTTP (rate-limit IP header, DB side-effects)
 * are marked with [requires-server] and will be skipped unless BASE_URL is set
 * to a running instance.
 *
 * Run pure tests:   npx playwright test tests/integration/validate-code.spec.ts
 * Run with server:  BASE_URL=http://localhost:3000 npx playwright test tests/integration/validate-code.spec.ts
 */

import { expect, test } from '@playwright/test';
import {
  normalizeCode,
  checkInvite,
  isIdempotentReclaim,
  type InviteRow,
} from '../../lib/training/validateInviteCode';

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const FUTURE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1_000).toISOString(); // 7 days from now
const PAST = new Date(Date.now() - 1).toISOString();                           // 1 ms ago

const TRAINER_ID = 'trainer-uuid-001';
const LEARNER_ID = 'learner-uuid-001';
const OTHER_ID = 'other-uuid-002';
const COURSE_ID = 'course-uuid-001';
const ORDER_ID = 'order-uuid-001';

function makeInvite(overrides: Partial<InviteRow> = {}): InviteRow {
  return {
    id: 'invite-uuid-001',
    status: 'sent',
    claimed_at: null,
    claimed_by: null,
    expires_at: FUTURE,
    email: 'learner@example.com',
    course_id: COURSE_ID,
    order_id: ORDER_ID,
    created_by: TRAINER_ID,
    ...overrides,
  };
}

// ─── 1. Code normalisation ────────────────────────────────────────────────────

test('normalizeCode: trims leading/trailing whitespace', () => {
  expect(normalizeCode('  abc  ')).toBe('ABC');
});

test('normalizeCode: uppercases', () => {
  expect(normalizeCode('abc123def')).toBe('ABC123DEF');
});

test('normalizeCode: strips all internal whitespace', () => {
  expect(normalizeCode('ABC 123\tDEF\n456')).toBe('ABC123DEF456');
});

test('normalizeCode: handles hyphen and underscore (not stripped)', () => {
  // base64url tokens may contain - and _
  expect(normalizeCode('abc-def_GHI')).toBe('ABC-DEF_GHI');
});

// ─── 2. checkInvite: success path ────────────────────────────────────────────

test('checkInvite: valid invite returns null (no error)', () => {
  const invite = makeInvite();
  const err = checkInvite(invite, LEARNER_ID, 'learner@example.com');
  expect(err).toBeNull();
});

// ─── 3. errorCode: not_found — handled at route level, not in checkInvite ───
//   (no invite row returned from DB → 200 { valid: false, errorCode: 'not_found' })

// ─── 4. errorCode: revoked ────────────────────────────────────────────────────

test('checkInvite: revoked status returns revoked error', () => {
  const invite = makeInvite({ status: 'revoked' });
  const err = checkInvite(invite, LEARNER_ID, 'learner@example.com');
  expect(err).not.toBeNull();
  expect(err!.errorCode).toBe('revoked');
  expect(err!.error).toContain('revoked');
});

// ─── 5. errorCode: claimed ────────────────────────────────────────────────────

test('checkInvite: claimed_at set + claimed_by different user → claimed error', () => {
  const invite = makeInvite({ claimed_at: PAST, claimed_by: OTHER_ID });
  const err = checkInvite(invite, LEARNER_ID, 'learner@example.com');
  expect(err).not.toBeNull();
  expect(err!.errorCode).toBe('claimed');
  expect(err!.error).toContain('already been used');
});

// ─── 6. errorCode: expired ────────────────────────────────────────────────────

test('checkInvite: expires_at in the past → expired error', () => {
  const invite = makeInvite({ expires_at: PAST });
  const err = checkInvite(invite, LEARNER_ID, 'learner@example.com');
  expect(err).not.toBeNull();
  expect(err!.errorCode).toBe('expired');
  expect(err!.error).toContain('expired');
});

test('checkInvite: null expires_at (never expires) → no error', () => {
  const invite = makeInvite({ expires_at: null });
  const err = checkInvite(invite, LEARNER_ID, 'learner@example.com');
  expect(err).toBeNull();
});

// ─── 7. errorCode: email_mismatch ────────────────────────────────────────────

test('checkInvite: email mismatch → email_mismatch error', () => {
  const invite = makeInvite({ email: 'trainer_target@company.com' });
  const err = checkInvite(invite, LEARNER_ID, 'other_person@example.com');
  expect(err).not.toBeNull();
  expect(err!.errorCode).toBe('email_mismatch');
  expect(err!.error).toContain('different email');
});

test('checkInvite: email match is case-insensitive', () => {
  const invite = makeInvite({ email: 'Learner@Example.COM' });
  const err = checkInvite(invite, LEARNER_ID, 'learner@example.com');
  expect(err).toBeNull();
});

// ─── 8. Idempotency ───────────────────────────────────────────────────────────

test('isIdempotentReclaim: same user claiming already-claimed invite → true', () => {
  const invite = makeInvite({ claimed_at: PAST, claimed_by: LEARNER_ID });
  expect(isIdempotentReclaim(invite, LEARNER_ID)).toBe(true);
});

test('isIdempotentReclaim: different user → false', () => {
  const invite = makeInvite({ claimed_at: PAST, claimed_by: OTHER_ID });
  expect(isIdempotentReclaim(invite, LEARNER_ID)).toBe(false);
});

test('isIdempotentReclaim: unclaimed invite → false', () => {
  const invite = makeInvite({ claimed_at: null, claimed_by: null });
  expect(isIdempotentReclaim(invite, LEARNER_ID)).toBe(false);
});

test('idempotency: checkInvite returns null (success) when same user reclaims', () => {
  // Simulates calling the route twice: second call sees claimed_at + claimed_by = user
  const invite = makeInvite({ claimed_at: PAST, claimed_by: LEARNER_ID });
  // checkInvite sees the claimed row and finds claimed_by === userId → returns null
  const err = checkInvite(invite, LEARNER_ID, 'learner@example.com');
  expect(err).toBeNull();
  // AND isIdempotentReclaim fires → route returns success without re-writing DB
  expect(isIdempotentReclaim(invite, LEARNER_ID)).toBe(true);
});

// ─── 9. Check-order: revoked is evaluated before expired/claimed ──────────────

test('checkInvite: revoked is the first check — wins over expired', () => {
  const invite = makeInvite({ status: 'revoked', expires_at: PAST });
  const err = checkInvite(invite, LEARNER_ID, 'learner@example.com');
  expect(err!.errorCode).toBe('revoked');
});

test('checkInvite: idempotent-reclaim check fires before expired check', () => {
  // Edge case: if invite is somehow expired but already claimed by this user,
  // we should return null (idempotent success) not expired error.
  const invite = makeInvite({ claimed_at: PAST, claimed_by: LEARNER_ID, expires_at: PAST });
  const err = checkInvite(invite, LEARNER_ID, 'learner@example.com');
  // claimed_at IS NOT NULL + claimed_by === userId → null (idempotent)
  expect(err).toBeNull();
});

// ─── 10. HTTP-level tests (requires running server) ──────────────────────────

const BASE_URL = process.env.BASE_URL;

test.describe('[requires-server] POST /api/training/exam/validate-code', () => {
  test.skip(!BASE_URL, 'Set BASE_URL=http://localhost:3000 to run server tests');

  test('returns 401 with errorCode=unauthorized when no auth header', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/training/exam/validate-code`, {
      data: { code: 'SOMETOKEN' },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.valid).toBe(false);
    expect(body.errorCode).toBe('unauthorized');
  });

  test('returns 200 { valid:false, errorCode:not_found } for unknown code', async ({
    request,
  }) => {
    // Uses the test user credentials created by make-test-user if available
    const testToken = process.env.TEST_BEARER_TOKEN;
    test.skip(!testToken, 'Set TEST_BEARER_TOKEN to run authenticated server tests');

    const res = await request.post(`${BASE_URL}/api/training/exam/validate-code`, {
      data: { code: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' },
      headers: { Authorization: `Bearer ${testToken}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.valid).toBe(false);
    expect(body.errorCode).toBe('not_found');
  });

  test('rate-limit: 11th request from same IP returns 429', async ({ request }) => {
    // NOTE: This test burns through rate-limit credits.
    // Only run against a dev instance with Upstash configured.
    test.skip(
      !process.env.UPSTASH_REDIS_REST_URL,
      'Set UPSTASH_REDIS_REST_URL to test rate limiting',
    );

    const fakeIp = `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const testToken = process.env.TEST_BEARER_TOKEN!;

    let lastRes: any;
    for (let i = 0; i < 11; i++) {
      lastRes = await request.post(`${BASE_URL}/api/training/exam/validate-code`, {
        data: { code: 'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ' },
        headers: {
          Authorization: `Bearer ${testToken}`,
          'X-Forwarded-For': fakeIp,
        },
      });
    }

    expect(lastRes.status()).toBe(429);
    const body = await lastRes.json();
    expect(body.valid).toBe(false);
    expect(body.errorCode).toBe('rate_limited');
  });

  test('[exam-access side-effect] after claim, GET /api/training/progress returns data (purchased=true)', async ({
    request,
  }) => {
    // This test requires a real invite token + a user that hasn't claimed it yet.
    // Set VALIDATE_CODE_TEST_TOKEN and TEST_BEARER_TOKEN in env before running.
    const inviteCode = process.env.VALIDATE_CODE_TEST_TOKEN;
    const testToken = process.env.TEST_BEARER_TOKEN;
    test.skip(
      !inviteCode || !testToken,
      'Set VALIDATE_CODE_TEST_TOKEN and TEST_BEARER_TOKEN to run this test',
    );

    // 1. Claim the seat
    const claimRes = await request.post(`${BASE_URL}/api/training/exam/validate-code`, {
      data: { code: inviteCode },
      headers: { Authorization: `Bearer ${testToken}` },
    });
    expect(claimRes.status()).toBe(200);
    const claimBody = await claimRes.json();
    expect(claimBody.valid).toBe(true);
    expect(typeof claimBody.claimedSeatInviteId).toBe('string');

    // 2. Verify enrollment was created (fetchExamStatus proxy)
    const progressRes = await request.get(
      `${BASE_URL}/api/training/progress?courseSlug=forklift`,
      { headers: { Authorization: `Bearer ${testToken}` } },
    );
    // 200 = enrolled (purchased=true in mobile app terms), 404 = not enrolled
    expect(progressRes.status()).toBe(200);
  });

  test('idempotency: calling twice returns success both times', async ({ request }) => {
    const inviteCode = process.env.VALIDATE_CODE_TEST_TOKEN;
    const testToken = process.env.TEST_BEARER_TOKEN;
    test.skip(
      !inviteCode || !testToken,
      'Set VALIDATE_CODE_TEST_TOKEN and TEST_BEARER_TOKEN to run this test',
    );

    const call = () =>
      request.post(`${BASE_URL}/api/training/exam/validate-code`, {
        data: { code: inviteCode },
        headers: { Authorization: `Bearer ${testToken}` },
      });

    const [r1, r2] = await Promise.all([call(), call()]);

    const b1 = await r1.json();
    const b2 = await r2.json();

    // Both must report valid:true (one is the real claim, one is the idempotent re-claim)
    expect(b1.valid).toBe(true);
    expect(b2.valid).toBe(true);
    expect(b1.claimedSeatInviteId).toBe(b2.claimedSeatInviteId);
  });
});
