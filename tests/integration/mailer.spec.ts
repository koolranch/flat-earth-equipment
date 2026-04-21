/**
 * Unit tests for lib/email/mailer.ts — specifically sendMailWithClient,
 * the testable core that maps Resend SDK responses to SendMailResult.
 *
 * Phase 4 fix context: prior to 2026-04-21 the mailer logged "[email] Sent"
 * unconditionally after `await resend.emails.send()` resolved, without
 * checking the SDK's `error` field. Because Resend's Node SDK does NOT throw
 * on API-level rejections (it resolves with { data: null, error: {...} }),
 * silent failures were being reported as successful sends. These tests lock
 * in the three response paths and prevent regression.
 */

import { expect, test } from '@playwright/test';
import {
  sendMailWithClient,
  type ResendLike,
  type Mail,
  type SendMailResult,
} from '../../lib/email/mailer';

const MSG: Mail = {
  to: 'employee@example.com',
  subject: 'Your OSHA forklift exam is unlocked',
  html: '<p>token: ABC123</p>',
};
const FROM = 'contact@flatearthequipment.com';

interface FakeClientOpts {
  resolveSuccess?: { id: string };
  resolveError?: { name: string; message: string };
  rejectWith?: Error;
}

function fakeClient(opts: FakeClientOpts): ResendLike & {
  calls: Array<{ from: string; to: string; subject: string; html: string }>;
} {
  const calls: Array<{ from: string; to: string; subject: string; html: string }> = [];
  return {
    calls,
    emails: {
      async send(payload) {
        calls.push(payload);
        if (opts.rejectWith) throw opts.rejectWith;
        if (opts.resolveError) {
          return { data: null, error: opts.resolveError };
        }
        if (opts.resolveSuccess) {
          return { data: opts.resolveSuccess, error: null };
        }
        return { data: { id: 'default-id' }, error: null };
      },
    },
  };
}

test.describe('sendMailWithClient — response handling (Phase 4)', () => {
  test('Resend returns { data: { id }, error: null } → ok:true with id', async () => {
    const client = fakeClient({ resolveSuccess: { id: 're_msg_abc123' } });

    const result: SendMailResult = await sendMailWithClient(client, MSG, FROM);

    expect(result).toEqual({ ok: true, id: 're_msg_abc123' });
    expect(client.calls).toHaveLength(1);
    expect(client.calls[0]).toEqual({
      from: FROM,
      to: MSG.to,
      subject: MSG.subject,
      html: MSG.html,
    });
  });

  test('Resend returns { data: null, error: { name, message } } → ok:false with error + error_name', async () => {
    const client = fakeClient({
      resolveError: {
        name: 'validation_error',
        message: 'Email address is on the suppression list.',
      },
    });

    const result: SendMailResult = await sendMailWithClient(client, MSG, FROM);

    expect(result).toMatchObject({
      ok: false,
      error: 'Email address is on the suppression list.',
      error_name: 'validation_error',
    });
    // Crucially: the previous implementation would have returned
    // { ok: true, id: undefined } here and logged "[email] Sent". The whole
    // point of this test is to guarantee that never happens again.
    expect((result as any).ok).toBe(false);
  });

  test('Resend throws (transport error) → ok:false with error', async () => {
    const client = fakeClient({ rejectWith: new Error('socket hang up') });

    const result: SendMailResult = await sendMailWithClient(client, MSG, FROM);

    expect(result).toMatchObject({
      ok: false,
      error: 'socket hang up',
    });
    // error_name only populated on API rejection, not transport; confirm absence
    expect((result as any).error_name).toBeUndefined();
  });

  test('Resend returns error shape with empty message → ok:false with fallback error text', async () => {
    // Defensive: the SDK's ErrorResponse type permits an empty message in
    // theory. We must still produce a usable error string so downstream
    // alert filters have something to match.
    const client = fakeClient({ resolveError: { name: 'rate_limit_exceeded', message: '' } });

    const result = await sendMailWithClient(client, MSG, FROM);

    expect(result).toMatchObject({
      ok: false,
      error: 'Resend API error',
      error_name: 'rate_limit_exceeded',
    });
  });

  test('success with missing data.id → ok:true with id undefined (no crash)', async () => {
    // Defensive: guard against SDK returning a success envelope without an id.
    const client: ResendLike = {
      emails: {
        async send() {
          return { data: null, error: null };
        },
      },
    };

    const result = await sendMailWithClient(client, MSG, FROM);

    expect(result).toEqual({ ok: true, id: undefined });
  });
});
