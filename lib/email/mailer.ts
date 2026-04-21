export type Mail = { to: string; subject: string; html: string; };

export type SendMailResult =
  | { ok: true; id?: string }
  | { ok: false; skipped: true }
  | { ok: false; error: string; error_name?: string };

/**
 * Minimal surface of the Resend client we actually use. Typed as `unknown`-ish
 * intentionally so tests can pass a fake with the same shape without pulling
 * the real SDK's type graph in, and without a `resend` build-time dependency.
 */
export interface ResendLike {
  emails: {
    send: (payload: {
      from: string;
      to: string;
      subject: string;
      html: string;
    }) => Promise<{
      data: { id?: string } | null;
      error: { name?: string; message?: string } | null;
    }>;
  };
}

let resend: ResendLike | null = null;
let resendInitialized = false;

async function initializeResend() {
  if (resendInitialized) return;
  resendInitialized = true;

  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend');
      resend = new Resend(process.env.RESEND_API_KEY) as ResendLike;
    } catch (err) {
      console.warn('[email] Failed to initialize Resend:', err);
    }
  }
}

/**
 * Pure core: given an explicit Resend client, send a message and map the
 * outcome to SendMailResult. Exported so tests can exercise the three paths
 * (success, API rejection, transport throw) without touching module-level
 * state or monkeypatching `import('resend')`.
 *
 * The Resend Node SDK resolves with { data, error } and does NOT throw on
 * API-level rejections (invalid recipient, suppression, validation,
 * rate limits, etc.). It only rejects the promise on network/transport
 * errors. We therefore MUST check result.error after the await; treating
 * a resolved promise as success — which this file did prior to 2026-04-21
 * — silently reported undelivered emails as "Sent". See Phase 3 report.
 */
export async function sendMailWithClient(
  client: ResendLike,
  msg: Mail,
  from: string,
): Promise<SendMailResult> {
  try {
    const result = await client.emails.send({
      from,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
    });

    if (result?.error) {
      console.error('[email] Resend rejected send:', {
        subject: msg.subject,
        to: msg.to,
        from,
        error_name: result.error.name,
        error_message: result.error.message,
      });
      return {
        ok: false,
        error: result.error.message || 'Resend API error',
        error_name: result.error.name,
      };
    }

    console.log('[email] Sent:', {
      subject: msg.subject,
      to: msg.to,
      messageId: result?.data?.id ?? null,
    });
    return { ok: true, id: result?.data?.id };
  } catch (err: any) {
    console.error('[email] Transport error:', {
      subject: msg.subject,
      to: msg.to,
      err: err?.message ?? String(err),
    });
    return { ok: false, error: err?.message || 'Unknown error' };
  }
}

export async function sendMail(msg: Mail): Promise<SendMailResult> {
  await initializeResend();

  if (!resend) {
    console.warn('[email] No RESEND_API_KEY — skip', msg.subject);
    return { ok: false, skipped: true };
  }

  const from = process.env.EMAIL_FROM || 'Flat Earth Safety <no-reply@flatearthequipment.com>';
  return sendMailWithClient(resend, msg, from);
}
