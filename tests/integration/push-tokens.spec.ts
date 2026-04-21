/**
 * Tests for the push-token registration routes and sendPushToUser helper.
 *
 * Test strategy
 * ─────────────
 * Unit tests (always run):
 *   Exercise _sendPushWithDeps with fully-mocked SenderDeps.
 *   No Supabase connection, no Expo SDK, no running server required.
 *
 * Server integration tests (skipped unless BASE_URL is set):
 *   Exercise POST /api/mobile/register-push-token and
 *   POST /api/mobile/deregister-push-token via real HTTP.
 *   Require BASE_URL and TEST_BEARER_TOKEN env vars.
 *   Confirm DB state via the Supabase service-role client, which in turn
 *   requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 *
 * Run unit tests:
 *   npx playwright test tests/integration/push-tokens.spec.ts
 *
 * Run with server:
 *   BASE_URL=http://localhost:3000 \
 *   TEST_BEARER_TOKEN=<token> \
 *   NEXT_PUBLIC_SUPABASE_URL=<url> \
 *   SUPABASE_SERVICE_ROLE_KEY=<key> \
 *   npx playwright test tests/integration/push-tokens.spec.ts
 */

import { expect, test } from '@playwright/test';
import { _sendPushWithDeps, type SenderDeps, type PushPayload } from '../../lib/push/sender-core';
import type { ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const USER_ID = 'test-user-uuid-001';
const TOKEN_A = 'ExponentPushToken[aaaBBBcccDDD111]';
const TOKEN_B = 'ExponentPushToken[eeeEEEfffFFF222]';
const PAYLOAD: PushPayload = { title: 'Hello', body: 'World', data: { key: 'value' } };

function makeOkTicket(): ExpoPushTicket {
  return { status: 'ok', id: 'ticket-ok' } as ExpoPushTicket;
}

function makeErrorTicket(errorCode: string): ExpoPushTicket {
  return { status: 'error', message: errorCode, details: { error: errorCode } } as any;
}

/**
 * Build a SenderDeps object with sensible defaults.
 * Pass overrides to test specific behaviours.
 */
function makeDeps(overrides: Partial<SenderDeps> = {}): SenderDeps & {
  _deleted: Array<{ userId: string; token: string }>;
  _sent: ExpoPushMessage[][];
} {
  const _deleted: Array<{ userId: string; token: string }> = [];
  const _sent: ExpoPushMessage[][] = [];

  return {
    fetchTokens: async () => [TOKEN_A],
    deleteToken: async (userId, token) => { _deleted.push({ userId, token }); },
    chunkMessages: (msgs) => [msgs],
    sendChunk: async (msgs) => { _sent.push(msgs); return msgs.map(() => makeOkTicket()); },
    ...overrides,
    _deleted,
    _sent,
  };
}

// ─── Unit: zero tokens ────────────────────────────────────────────────────────

test('sendPushToUser: zero tokens returns { sent:0, failed:0 } without calling Expo SDK', async () => {
  let sendChunkCalled = false;

  const deps = makeDeps({
    fetchTokens: async () => [],
    sendChunk: async () => { sendChunkCalled = true; return []; },
  });

  const result = await _sendPushWithDeps(USER_ID, PAYLOAD, deps);

  expect(result).toEqual({ sent: 0, failed: 0 });
  expect(sendChunkCalled).toBe(false);
});

// ─── Unit: happy path with one token ─────────────────────────────────────────

test('sendPushToUser: one token, ok ticket → { sent:1, failed:0 }', async () => {
  const deps = makeDeps();
  const result = await _sendPushWithDeps(USER_ID, PAYLOAD, deps);

  expect(result).toEqual({ sent: 1, failed: 0 });
  expect(deps._sent).toHaveLength(1);
  expect(deps._sent[0][0].to).toBe(TOKEN_A);
  expect(deps._sent[0][0].sound).toBe('default');
});

test('sendPushToUser: sound=null sends undefined sound (silent notification)', async () => {
  const deps = makeDeps();
  await _sendPushWithDeps(USER_ID, { ...PAYLOAD, sound: null }, deps);

  expect(deps._sent[0][0].sound).toBeUndefined();
});

test('sendPushToUser: multiple tokens are all sent', async () => {
  const deps = makeDeps({
    fetchTokens: async () => [TOKEN_A, TOKEN_B],
    sendChunk: async (msgs) => msgs.map(() => makeOkTicket()),
  });

  const result = await _sendPushWithDeps(USER_ID, PAYLOAD, deps);
  expect(result).toEqual({ sent: 2, failed: 0 });
});

// ─── Unit: DeviceNotRegistered deletes the token ─────────────────────────────

test('sendPushToUser: DeviceNotRegistered ticket causes token deletion', async () => {
  const deps = makeDeps({
    sendChunk: async () => [makeErrorTicket('DeviceNotRegistered')],
  });

  const result = await _sendPushWithDeps(USER_ID, PAYLOAD, deps);

  expect(result).toEqual({ sent: 0, failed: 1 });
  expect(deps._deleted).toHaveLength(1);
  expect(deps._deleted[0]).toEqual({ userId: USER_ID, token: TOKEN_A });
});

test('sendPushToUser: InvalidCredentials ticket causes token deletion', async () => {
  const deps = makeDeps({
    sendChunk: async () => [makeErrorTicket('InvalidCredentials')],
  });

  const result = await _sendPushWithDeps(USER_ID, PAYLOAD, deps);

  expect(result.failed).toBe(1);
  expect(deps._deleted).toHaveLength(1);
});

test('sendPushToUser: non-removal error ticket increments failed but does NOT delete token', async () => {
  const deps = makeDeps({
    sendChunk: async () => [makeErrorTicket('MessageRateExceeded')],
  });

  const result = await _sendPushWithDeps(USER_ID, PAYLOAD, deps);

  expect(result).toEqual({ sent: 0, failed: 1 });
  expect(deps._deleted).toHaveLength(0);
});

// ─── Unit: SDK exception does not throw ──────────────────────────────────────

test('sendPushToUser: sendChunk throwing does NOT throw to caller and returns failed>0', async () => {
  const deps = makeDeps({
    sendChunk: async () => { throw new Error('Expo network timeout'); },
  });

  // Must not throw
  const result = await _sendPushWithDeps(USER_ID, PAYLOAD, deps);

  expect(result.failed).toBeGreaterThan(0);
  expect(result.sent).toBe(0);
});

test('sendPushToUser: fetchTokens throwing does NOT throw to caller and returns failed>0', async () => {
  const deps = makeDeps({
    fetchTokens: async () => { throw new Error('DB down'); },
  });

  const result = await _sendPushWithDeps(USER_ID, PAYLOAD, deps);

  expect(result.failed).toBeGreaterThan(0);
  expect(result.sent).toBe(0);
});

// ─── Unit: chunking is respected ─────────────────────────────────────────────

test('sendPushToUser: sends one HTTP call per chunk', async () => {
  let chunkCallCount = 0;
  const deps = makeDeps({
    fetchTokens: async () => [TOKEN_A, TOKEN_B],
    // Split into individual chunks (simulating Expo's 100-msg limit)
    chunkMessages: (msgs) => msgs.map((m) => [m]),
    sendChunk: async (msgs) => {
      chunkCallCount++;
      return msgs.map(() => makeOkTicket());
    },
  });

  const result = await _sendPushWithDeps(USER_ID, PAYLOAD, deps);

  expect(result).toEqual({ sent: 2, failed: 0 });
  expect(chunkCallCount).toBe(2);
});

// ─── Unit: partial chunk failure ─────────────────────────────────────────────

test('sendPushToUser: one chunk throws, other succeeds → correct counts', async () => {
  let callCount = 0;
  const deps = makeDeps({
    fetchTokens: async () => [TOKEN_A, TOKEN_B],
    chunkMessages: (msgs) => msgs.map((m) => [m]),
    sendChunk: async (msgs) => {
      callCount++;
      if (callCount === 1) throw new Error('transient error');
      return [makeOkTicket()];
    },
  });

  const result = await _sendPushWithDeps(USER_ID, PAYLOAD, deps);

  // Chunk 1 failed (1 msg lost), chunk 2 succeeded (1 sent)
  expect(result.sent).toBe(1);
  expect(result.failed).toBe(1);
});

// ─── Server integration tests (require BASE_URL + credentials) ───────────────

const BASE_URL = process.env.BASE_URL;
const TEST_BEARER_TOKEN = process.env.TEST_BEARER_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TEST_TOKEN = `ExponentPushToken[test${Date.now()}]`;

/** Lightweight service-role Supabase client for test assertions. */
async function serviceClient() {
  const { createClient } = await import('@supabase/supabase-js');
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error('Missing Supabase env vars');
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
}

test.describe('[requires-server] push-token routes', () => {
  test.skip(!BASE_URL || !TEST_BEARER_TOKEN, 'Set BASE_URL and TEST_BEARER_TOKEN to run server tests');

  const authHeaders = { Authorization: `Bearer ${TEST_BEARER_TOKEN}` };

  // ── Route: 401 when unauthenticated ────────────────────────────────────────

  test('register: returns 401 when no auth header', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/mobile/register-push-token`, {
      data: { token: TEST_TOKEN, platform: 'ios' },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.reason).toBe('unauthorized');
  });

  test('deregister: returns 401 when no auth header', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/mobile/deregister-push-token`, {
      data: { token: TEST_TOKEN },
    });
    expect(res.status()).toBe(401);
    expect((await res.json()).ok).toBe(false);
  });

  // ── Route: 400 validation ──────────────────────────────────────────────────

  test('register: returns 400 for invalid platform', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/mobile/register-push-token`, {
      data: { token: TEST_TOKEN, platform: 'windows' },
      headers: authHeaders,
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).reason).toBe('invalid_body');
  });

  test('register: returns 400 for invalid token format', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/mobile/register-push-token`, {
      data: { token: 'not-an-expo-token', platform: 'ios' },
      headers: authHeaders,
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).reason).toBe('invalid_token');
  });

  test('register: returns 400 when token field is missing', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/mobile/register-push-token`, {
      data: { platform: 'android' },
      headers: authHeaders,
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).reason).toBe('invalid_body');
  });

  // ── Route: register and confirm DB state ───────────────────────────────────

  test('register: row appears in push_tokens with correct platform', async ({ request }) => {
    test.skip(!SUPABASE_URL || !SERVICE_ROLE_KEY, 'Set SUPABASE env vars to verify DB state');

    const res = await request.post(`${BASE_URL}/api/mobile/register-push-token`, {
      data: { token: TEST_TOKEN, platform: 'ios' },
      headers: authHeaders,
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).ok).toBe(true);

    const svc = await serviceClient();
    const { data } = await svc
      .from('push_tokens')
      .select('token, platform')
      .eq('token', TEST_TOKEN)
      .maybeSingle();

    expect(data).not.toBeNull();
    expect(data!.platform).toBe('ios');

    // Clean up
    await svc.from('push_tokens').delete().eq('token', TEST_TOKEN);
  });

  // ── Route: upsert — no duplicate row, updated_at refreshes ────────────────

  test('register same token twice: one row, updated_at refreshes, platform updates', async ({
    request,
  }) => {
    test.skip(!SUPABASE_URL || !SERVICE_ROLE_KEY, 'Set SUPABASE env vars to verify DB state');

    const svc = await serviceClient();

    // First registration: ios
    await request.post(`${BASE_URL}/api/mobile/register-push-token`, {
      data: { token: TEST_TOKEN, platform: 'ios' },
      headers: authHeaders,
    });
    const { data: first } = await svc
      .from('push_tokens')
      .select('id, platform, updated_at')
      .eq('token', TEST_TOKEN)
      .maybeSingle();

    // Small pause so updated_at must differ if it's working correctly
    await new Promise((r) => setTimeout(r, 50));

    // Second registration: android (platform switch)
    const res2 = await request.post(`${BASE_URL}/api/mobile/register-push-token`, {
      data: { token: TEST_TOKEN, platform: 'android' },
      headers: authHeaders,
    });
    expect(res2.status()).toBe(200);

    const { data: rows } = await svc
      .from('push_tokens')
      .select('id, platform, updated_at')
      .eq('token', TEST_TOKEN);

    // Exactly one row (no duplicate)
    expect(rows).toHaveLength(1);
    expect(rows![0].id).toBe(first!.id);
    expect(rows![0].platform).toBe('android');
    expect(rows![0].updated_at).not.toBe(first!.updated_at);

    await svc.from('push_tokens').delete().eq('token', TEST_TOKEN);
  });

  // ── Route: deregister deletes the row ─────────────────────────────────────

  test('deregister: removes the token row from DB', async ({ request }) => {
    test.skip(!SUPABASE_URL || !SERVICE_ROLE_KEY, 'Set SUPABASE env vars to verify DB state');

    const svc = await serviceClient();

    // Register first
    await request.post(`${BASE_URL}/api/mobile/register-push-token`, {
      data: { token: TEST_TOKEN, platform: 'ios' },
      headers: authHeaders,
    });

    // Deregister
    const res = await request.post(`${BASE_URL}/api/mobile/deregister-push-token`, {
      data: { token: TEST_TOKEN },
      headers: authHeaders,
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).ok).toBe(true);

    const { data } = await svc
      .from('push_tokens')
      .select('id')
      .eq('token', TEST_TOKEN)
      .maybeSingle();

    expect(data).toBeNull();
  });

  // ── Route: deregister non-existent token is idempotent ────────────────────

  test('deregister a token that was never registered returns 200', async ({ request }) => {
    const neverRegistered = 'ExponentPushToken[neverRegisteredXYZ999]';

    const res = await request.post(`${BASE_URL}/api/mobile/deregister-push-token`, {
      data: { token: neverRegistered },
      headers: authHeaders,
    });

    expect(res.status()).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });
});
