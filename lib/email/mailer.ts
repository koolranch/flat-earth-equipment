export type Mail = { to: string; subject: string; html: string; };

let resend: any = null;
let resendInitialized = false;

async function initializeResend() {
  if (resendInitialized) return;
  resendInitialized = true;
  
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend');
      resend = new Resend(process.env.RESEND_API_KEY);
    } catch (err) {
      console.warn('[email] Failed to initialize Resend:', err);
    }
  }
}

export async function sendMail(msg: Mail) {
  await initializeResend();
  
  if (!resend) {
    console.warn('[email] No RESEND_API_KEY — skip', msg.subject);
    return { ok: false, skipped: true };
  }
  
  const from = process.env.EMAIL_FROM || 'Flat Earth Safety <no-reply@flatearthequipment.com>';
  
  try {
    const result = await resend.emails.send({
      from,
      to: msg.to,
      subject: msg.subject,
      html: msg.html
    });
    
    console.log('[email] Sent:', msg.subject, 'to', msg.to);
    return { ok: true, id: result.data?.id };
  } catch (err: any) {
    console.error('[email] Failed to send:', msg.subject, err);
    return { ok: false, error: err?.message || 'Unknown error' };
  }
}
