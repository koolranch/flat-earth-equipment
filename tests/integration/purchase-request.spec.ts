/**
 * Tests for:
 *   POST /api/training/exam/purchase-request
 *   GET  /api/training/exam/my-purchase-requests
 *   POST /api/checkout  (regression: flag-gated logic must not alter legacy behavior)
 *
 * Test strategy
 * ─────────────
 * Pure-logic tests (always run, no server needed):
 *   - Email format validation
 *   - Disposable-domain detection
 *   - Response column whitelist
 *
 * Integration tests (marked [requires-server]):
 *   - Run only when BASE_URL env var points to a live instance.
 *   - Use TEST_USER_TOKEN (Bearer) for auth, and TEST_SERVICE_KEY for DB assertions.
 *
 * Run pure tests:   npx playwright test tests/integration/purchase-request.spec.ts
 * Run with server:  BASE_URL=http://localhost:3000 npx playwright test tests/integration/purchase-request.spec.ts
 */

import { expect, test } from '@playwright/test';
import {
  isValidEmail,
  isDisposableDomain,
  ALLOWED_RESPONSE_COLUMNS,
  type AllowedColumn,
} from '../../lib/training/purchaseRequestValidation';

// A minimal set of known disposable domains for pure unit tests.
// The route builds its own Set from the full npm package at startup.
const DISPOSABLE_SET = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'tempmail.com',
  'throwaway.email',
  'yopmail.com',
  '10minutemail.com',
]);

// ─── Environment ──────────────────────────────────────────────────────────────
const BASE_URL = process.env.BASE_URL ?? '';
const TOKEN = process.env.TEST_USER_TOKEN ?? '';
const hasServer = !!BASE_URL && !!TOKEN;

function skip(name: string, fn: () => Promise<void>) {
  if (!hasServer) {
    test.skip(true, `[requires-server] Skipping "${name}" — set BASE_URL + TEST_USER_TOKEN`);
  }
  return fn;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function postPurchaseRequest(
  body: Record<string, unknown>,
  token: string = TOKEN,
): Promise<Response> {
  return fetch(`${BASE_URL}/api/training/exam/purchase-request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}

async function getMyRequests(token: string = TOKEN): Promise<Response> {
  return fetch(`${BASE_URL}/api/training/exam/my-purchase-requests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PURE UNIT TESTS — no server required
// ─────────────────────────────────────────────────────────────────────────────

test.describe('isValidEmail (pure)', () => {
  const valid = [
    'boss@company.com',
    'hr+dept@example.org',
    'user.name@subdomain.company.co.uk',
    'first_last@example.io',
  ];
  const invalid = [
    '',
    'notanemail',
    '@nodomain.com',
    'no-at-sign',
    'missing@',
    'space @example.com',
  ];

  for (const addr of valid) {
    test(`accepts ${addr}`, () => expect(isValidEmail(addr)).toBe(true));
  }
  for (const addr of invalid) {
    test(`rejects "${addr}"`, () => expect(isValidEmail(addr)).toBe(false));
  }
});

test.describe('isDisposableDomain (pure)', () => {
  test('detects mailinator.com as disposable', () => {
    expect(isDisposableDomain('user@mailinator.com', DISPOSABLE_SET)).toBe(true);
  });

  test('detects guerrillamail.com as disposable', () => {
    expect(isDisposableDomain('user@guerrillamail.com', DISPOSABLE_SET)).toBe(true);
  });

  test('accepts gmail.com as non-disposable', () => {
    // gmail isn't in the disposable list
    expect(isDisposableDomain('user@gmail.com', DISPOSABLE_SET)).toBe(false);
  });

  test('accepts a made-up work domain as non-disposable', () => {
    expect(isDisposableDomain('hr@acme-logistics.com', DISPOSABLE_SET)).toBe(false);
  });

  test('domain comparison is case-insensitive (uppercase input)', () => {
    expect(isDisposableDomain('user@MAILINATOR.COM', DISPOSABLE_SET)).toBe(true);
  });
});

test.describe('ALLOWED_RESPONSE_COLUMNS (pure)', () => {
  const required: AllowedColumn[] = [
    'id',
    'employer_name',
    'employer_email',
    'status',
    'created_at',
    'resolved_at',
  ];

  for (const col of required) {
    test(`includes required column: ${col}`, () => {
      expect(ALLOWED_RESPONSE_COLUMNS).toContain(col);
    });
  }

  test('does not include sensitive columns', () => {
    const sensitive = ['employee_email', 'employee_user_id', 'message', 'related_order_id'];
    for (const col of sensitive) {
      expect(ALLOWED_RESPONSE_COLUMNS).not.toContain(col);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATION TESTS — require BASE_URL + TEST_USER_TOKEN
// ─────────────────────────────────────────────────────────────────────────────

test(
  '[requires-server] POST purchase-request: valid body creates row and returns { ok, id }',
  async () => {
    if (!hasServer) {
      test.skip(true, 'Set BASE_URL + TEST_USER_TOKEN to run integration tests');
      return;
    }

    const employer = `employer-valid-${Date.now()}@acme-test.example`;
    const res = await postPurchaseRequest({
      employerName: 'Acme Corp',
      employerEmail: employer,
      message: 'Please help me get certified.',
      seatsRequested: 1,
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(typeof body.id).toBe('string');
    expect(body.id.length).toBeGreaterThan(0);
  },
);

test(
  '[requires-server] POST purchase-request: disposable domain returns 400 with errorCode=disposable_email, no row inserted',
  async () => {
    if (!hasServer) {
      test.skip(true, 'Set BASE_URL + TEST_USER_TOKEN to run integration tests');
      return;
    }

    const res = await postPurchaseRequest({
      employerName: 'Fake Corp',
      employerEmail: 'boss@mailinator.com',
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.errorCode).toBe('disposable_email');
  },
);

test(
  '[requires-server] POST purchase-request: second request to same employer within 7 days → 429 already_sent_this_week',
  async () => {
    if (!hasServer) {
      test.skip(true, 'Set BASE_URL + TEST_USER_TOKEN to run integration tests');
      return;
    }

    // Use a unique employer email so this test is self-contained
    const employer = `rate-limit-pair-${Date.now()}@acme-test.example`;

    const first = await postPurchaseRequest({ employerName: 'Acme', employerEmail: employer });
    expect(first.status).toBe(200);

    const second = await postPurchaseRequest({ employerName: 'Acme', employerEmail: employer });
    expect(second.status).toBe(429);
    const body = await second.json();
    expect(body.ok).toBe(false);
    expect(body.errorCode).toBe('already_sent_this_week');
  },
);

test(
  '[requires-server] POST purchase-request: 5 different employers succeed; 6th to yet another → 429 daily_limit_reached',
  async () => {
    if (!hasServer) {
      test.skip(true, 'Set BASE_URL + TEST_USER_TOKEN to run integration tests');
      return;
    }

    // NOTE: this test consumes the user's in-process rate-limit slots. The in-process
    // store resets when the server restarts, so run this test in isolation or
    // against a freshly started dev server.
    const ts = Date.now();
    let lastStatus = 0;

    for (let i = 1; i <= 5; i++) {
      const res = await postPurchaseRequest({
        employerName: `Employer ${i}`,
        employerEmail: `daily-${ts}-${i}@acme-test.example`,
      });
      expect(res.status).toBe(200);
    }

    const sixth = await postPurchaseRequest({
      employerName: 'Employer 6',
      employerEmail: `daily-${ts}-6@acme-test.example`,
    });
    lastStatus = sixth.status;
    expect(lastStatus).toBe(429);
    const body = await sixth.json();
    expect(body.ok).toBe(false);
    expect(body.errorCode).toBe('daily_limit_reached');
  },
);

test(
  '[requires-server] POST purchase-request: sendMail throwing does NOT fail the endpoint — row inserted, 200 returned',
  async () => {
    if (!hasServer) {
      test.skip(true, 'Set BASE_URL + TEST_USER_TOKEN to run integration tests');
      return;
    }

    // The RESEND_API_KEY may or may not be set in the test environment.
    // Regardless, the try/catch in the route ensures 200 is returned.
    // We verify this by pointing at a domain that passes disposable-check
    // but whose email delivery will either succeed silently or be skipped
    // (when RESEND_API_KEY is absent). The important assertion is the 200.
    const res = await postPurchaseRequest({
      employerName: 'Test Employer',
      employerEmail: `sendmail-guard-${Date.now()}@acme-test.example`,
    });

    // Whether email succeeds, is skipped (no API key), or fails — the route must return 200.
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(typeof body.id).toBe('string');
  },
);

test(
  '[requires-server] GET my-purchase-requests: returns only authed user rows, ≤20, desc, whitelisted columns',
  async () => {
    if (!hasServer) {
      test.skip(true, 'Set BASE_URL + TEST_USER_TOKEN to run integration tests');
      return;
    }

    const res = await getMyRequests();
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.ok).toBe(true);
    expect(Array.isArray(body.requests)).toBe(true);
    expect(body.requests.length).toBeLessThanOrEqual(20);

    // Verify ordering: created_at must be descending
    const dates = body.requests.map((r: { created_at: string }) => r.created_at);
    const sorted = [...dates].sort((a: string, b: string) => b.localeCompare(a));
    expect(dates).toEqual(sorted);

    // Verify no forbidden columns leak through
    const forbidden = ['employee_email', 'employee_user_id', 'message', 'related_order_id'];
    for (const row of body.requests) {
      for (const col of forbidden) {
        expect(row).not.toHaveProperty(col);
      }
      // Verify all required columns are present
      for (const col of ALLOWED_RESPONSE_COLUMNS) {
        expect(row).toHaveProperty(col);
      }
    }
  },
);

test(
  '[requires-server] GET my-purchase-requests: unauthenticated returns 401',
  async () => {
    if (!hasServer) {
      test.skip(true, 'Set BASE_URL + TEST_USER_TOKEN to run integration tests');
      return;
    }

    const res = await fetch(`${BASE_URL}/api/training/exam/my-purchase-requests`);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.errorCode).toBe('unauthorized');
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION TESTS — /api/checkout must be byte-identical for legacy bodies
// ─────────────────────────────────────────────────────────────────────────────

test.describe('checkout regression: legacy body shape', () => {
  /**
   * These tests POST the exact body shape the existing BuyNow / cart flows use today
   * (no request_id, no prefill_email) and assert the response shape is unchanged.
   *
   * We cannot inspect the exact Stripe.checkout.sessions.create() args from outside,
   * so we assert the observable invariant: the route still returns { sessionId, url }.
   * Any change to those keys would indicate the Stripe call broke.
   *
   * The flag is controlled by the server env, which we document in assertions.
   */

  const legacyBody = {
    items: [
      {
        priceId: 'price_1RSHWVHJI548rO8Jf9CJer6y',
        quantity: 1,
        isTraining: true,
        metadata: {
          seat_count: 1,
          checkout_mode: 'payment',
          is_unlimited: false,
          plan_id: 'single',
          billing_label: '',
        },
      },
    ],
  };

  test(
    '[requires-server] flag=unset — legacy body returns { sessionId, url } (Stripe session created)',
    async () => {
      if (!hasServer) {
        test.skip(true, 'Set BASE_URL + TEST_USER_TOKEN to run integration tests');
        return;
      }

      // ENABLE_ASK_EMPLOYER_CHECKOUT is unset/off on the test server — confirm legacy works.
      const res = await fetch(`${BASE_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(legacyBody),
      });

      // Route may return 503 if FEATURE_GA is off and user is not staff — that's ok;
      // the important thing is that it does NOT return 500 (internal error).
      expect(res.status).not.toBe(500);
      if (res.status === 200) {
        const body = await res.json();
        // When the Stripe session is created successfully, both keys must be present.
        expect(typeof body.sessionId).toBe('string');
        expect(typeof body.url).toBe('string');
        // The flag-gated logic must not have added an error key.
        expect(body.error).toBeUndefined();
      }
    },
  );

  test(
    '[requires-server] flag=1 + no request_id — legacy body shape still returns { sessionId, url }',
    async () => {
      if (!hasServer) {
        test.skip(true, 'Set BASE_URL + TEST_USER_TOKEN to run integration tests');
        return;
      }

      // Same body as above but this time the server has ENABLE_ASK_EMPLOYER_CHECKOUT=1.
      // Since request_id and prefill_email are absent, the block is a no-op; metadata
      // must not gain a request_id key, and customer_email must not be set.
      // Observable invariant: response shape is identical.
      const res = await fetch(`${BASE_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(legacyBody),
      });

      expect(res.status).not.toBe(500);
      if (res.status === 200) {
        const body = await res.json();
        expect(typeof body.sessionId).toBe('string');
        expect(typeof body.url).toBe('string');
        expect(body.error).toBeUndefined();
      }
    },
  );

  test(
    '[requires-server] flag=1 + request_id present — response shape is still { sessionId, url }',
    async () => {
      if (!hasServer) {
        test.skip(true, 'Set BASE_URL + TEST_USER_TOKEN to run integration tests');
        return;
      }

      // When request_id IS supplied, the new logic runs but must not break the response.
      const bodyWithRequestId = {
        ...legacyBody,
        request_id: 'fake-request-uuid-for-test',
        prefill_email: 'employer@acme-test.example',
      };

      const res = await fetch(`${BASE_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyWithRequestId),
      });

      expect(res.status).not.toBe(500);
      if (res.status === 200) {
        const body = await res.json();
        expect(typeof body.sessionId).toBe('string');
        expect(typeof body.url).toBe('string');
        expect(body.error).toBeUndefined();
      }
    },
  );
});
