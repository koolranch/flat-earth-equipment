/**
 * Forklift Certified abandoned-checkout emails for the $49 operator
 * certification bought on getforkliftcertified.com/certification.
 *
 * Two touches only: one when the Stripe session expires (1 hour after it was
 * opened), one roughly a day later. Both link to Stripe's recovery URL, which
 * reopens checkout with the same price and prefilled email. Never sent for
 * FEE-hosted (/safety) purchases — see lib/training/checkoutRecovery.server.ts.
 */

const BRAND_ORANGE = '#F76511';
const SUPPORT_EMAIL = 'support@getforkliftcertified.com';

function shell(body: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 540px; margin: 0 auto; padding: 20px;">
      ${body}
      <hr style="border: none; height: 1px; background: #e2e8f0; margin: 28px 0;">
      <div style="color: #64748b; font-size: 12px;">
        <p style="margin: 0;"><strong>Forklift Certified</strong> — OSHA-aligned forklift operator certification</p>
        <p style="margin: 4px 0 0 0;">getforkliftcertified.com · ${SUPPORT_EMAIL}</p>
        <p style="margin: 10px 0 0 0;">You're getting this because you started checkout at getforkliftcertified.com. Forklift Certified is a Flat Earth Equipment brand.</p>
      </div>
    </body>
    </html>
  `;
}

function button(href: string, label: string): string {
  return `
    <p style="margin: 24px 0;">
      <a href="${href}" style="display: inline-block; background: ${BRAND_ORANGE}; color: #ffffff; text-decoration: none; padding: 13px 24px; border-radius: 8px; font-weight: 600; font-size: 15px;">${label}</a>
    </p>
  `;
}

/** Sent when the 1-hour session expires. */
export function gfcCheckoutRecoveryFirstEmail(params: { recoveryUrl: string }): {
  subject: string;
  html: string;
  text: string;
} {
  const { recoveryUrl } = params;
  const subject = 'Your forklift certification checkout is still open';
  const html = shell(`
    <p style="font-size: 15px;">You started the $49 forklift operator certification a little while ago but didn't finish checkout. Your spot is saved — pick up right where you left off:</p>
    ${button(recoveryUrl, 'Finish checkout — $49')}
    <p style="font-size: 15px;">What happens after you pay:</p>
    <ul style="font-size: 15px; padding-left: 20px; margin: 8px 0 0 0;">
      <li>Your login arrives by email within a minute.</li>
      <li>Train on your phone — most operators finish in about 30 minutes.</li>
      <li>Pass the written exam (unlimited retakes) and download your certificate, valid 3 years.</li>
    </ul>
    <p style="font-size: 14px; color: #334155; margin-top: 20px;">Questions before you buy? Reply to this email or write to <a href="mailto:${SUPPORT_EMAIL}" style="color: ${BRAND_ORANGE};">${SUPPORT_EMAIL}</a>.</p>
  `);
  const text = `You started the $49 forklift operator certification but didn't finish checkout. Pick up where you left off: ${recoveryUrl}

After you pay: your login arrives by email within a minute, training takes most operators about 30 minutes on a phone, and you download your certificate (valid 3 years) when you pass the written exam. Unlimited retakes.

Questions? Reply to this email or write to ${SUPPORT_EMAIL}.

Forklift Certified is a Flat Earth Equipment brand.`;
  return { subject, html, text };
}

/** Sent about a day later. Last touch. */
export function gfcCheckoutRecoverySecondEmail(params: { recoveryUrl: string }): {
  subject: string;
  html: string;
  text: string;
} {
  const { recoveryUrl } = params;
  const subject = 'Still need your forklift certification?';
  const html = shell(`
    <p style="font-size: 15px;">Quick follow-up — your $49 forklift certification checkout is still available if you want it.</p>
    ${button(recoveryUrl, 'Finish checkout — $49')}
    <p style="font-size: 15px;">One-time payment, no subscription. Certificate has a unique ID and QR code employers can verify online, and it's valid nationwide for 3 years — OSHA 1910.178 is a federal rule.</p>
    <p style="font-size: 15px;">One honest note: your employer still completes a short hands-on evaluation at work. This course covers the formal instruction and written exam OSHA requires.</p>
    <p style="font-size: 14px; color: #334155; margin-top: 20px;">This is the last reminder we'll send. If we can answer anything, reply here or write to <a href="mailto:${SUPPORT_EMAIL}" style="color: ${BRAND_ORANGE};">${SUPPORT_EMAIL}</a>.</p>
  `);
  const text = `Quick follow-up — your $49 forklift certification checkout is still available: ${recoveryUrl}

One-time payment, no subscription. The certificate has a unique ID and QR code employers can verify online, valid nationwide for 3 years. Your employer still completes a short hands-on evaluation at work; this course covers the formal instruction and written exam.

This is the last reminder we'll send. Questions: ${SUPPORT_EMAIL}

Forklift Certified is a Flat Earth Equipment brand.`;
  return { subject, html, text };
}
