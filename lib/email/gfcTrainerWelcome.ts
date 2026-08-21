/**
 * Forklift Certified (getforkliftcertified.com) branded trainer welcome email.
 *
 * Sent instead of the Flat Earth Safety template when a subscription checkout
 * originated from the GFC marketing site (item_0_utm_source metadata), so
 * employer buyers never see an unfamiliar brand right after signing up.
 * Sends from the GFC domain, which is verified on the shared Resend account.
 */

export const GFC_EMAIL_FROM = 'Forklift Certified <no-reply@getforkliftcertified.com>';
export const GFC_APP_BASE_URL = 'https://app.getforkliftcertified.com';

const GFC_DASHBOARD_URL = `${GFC_APP_BASE_URL}/trainer`;
const GFC_SUPPORT_EMAIL = 'support@getforkliftcertified.com';
const BRAND_ORANGE = '#F76511';

const PLAN_LABELS: Record<string, string> = {
  crew_monthly: 'Crew plan — 10 training seats, $99/month',
  crew_annual: 'Crew plan — 10 training seats, $990/year',
  facility_monthly: 'Facility plan — unlimited seats, $199/month',
  unlimited: 'Facility plan — unlimited seats, $1,999/year',
};

export function gfcPlanLabel(planId: string): string {
  return PLAN_LABELS[planId] || 'your training plan';
}

export function generateGfcTrainerWelcomeEmail(params: {
  firstName: string;
  email: string;
  password: string;
  planId: string;
  trialDays: number;
}): { subject: string; html: string } {
  const { firstName, email, password, planId, trialDays } = params;
  const planLabel = gfcPlanLabel(planId);
  const onTrial = trialDays > 0;

  const subject = onTrial
    ? `Welcome ${firstName} — your Forklift Certified trial has started`
    : `Welcome ${firstName} — your Forklift Certified plan is active`;

  const trialBlock = onTrial
    ? `
      <div style="background: #fff7ed; border: 1px solid #fdba74; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 14px; color: #9a3412;">
          <strong>Your ${trialDays}-day free trial is active.</strong> Nothing is billed until the
          trial ends, and you can cancel anytime before then at no charge.
        </p>
      </div>`
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Forklift Certified</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: ${BRAND_ORANGE}; color: white; padding: 28px; border-radius: 10px; text-align: center; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 26px;">Welcome to Forklift Certified</h1>
        <p style="margin: 8px 0 0 0; font-size: 15px; opacity: 0.95;">${planLabel}</p>
      </div>

      <p style="font-size: 15px;">Hi ${firstName},</p>
      <p style="font-size: 15px;">
        Your manager account is ready. Invite your crew, track their training, and export
        audit-ready records — all from your dashboard.
      </p>

      ${trialBlock}

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #0f172a;">Your sign-in details</h3>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Temporary password:</strong>
          <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${password}</code>
        </p>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748b;">You can change your password anytime after signing in.</p>
      </div>

      <div style="text-align: center; margin: 26px 0;">
        <a href="${GFC_DASHBOARD_URL}"
           style="display: inline-block; background: ${BRAND_ORANGE}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
          Open your dashboard
        </a>
      </div>

      <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #0f172a;">Get your crew training in 3 steps</h3>
        <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #334155;">
          <li style="margin-bottom: 8px;"><strong>Sign in</strong> at app.getforkliftcertified.com with the details above.</li>
          <li style="margin-bottom: 8px;"><strong>Invite operators</strong> — paste their emails and each one gets a training seat instantly.</li>
          <li><strong>Track progress</strong> — see who's certified, run practical evaluations, and export records for OSHA audits.</li>
        </ol>
      </div>

      <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #0f172a;">What each operator gets</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #334155;">
          <li style="margin-bottom: 6px;">OSHA-aligned training they can finish on their phone in under 30 minutes</li>
          <li style="margin-bottom: 6px;">Interactive lessons, exams, and unlimited retakes — in English or Spanish</li>
          <li style="margin-bottom: 6px;">A QR-verifiable certificate valid for 3 years</li>
        </ul>
      </div>

      <p style="font-size: 14px; color: #334155;">
        Questions? Just reply to this email or write to
        <a href="mailto:${GFC_SUPPORT_EMAIL}" style="color: ${BRAND_ORANGE};">${GFC_SUPPORT_EMAIL}</a>
        — we respond within one business day.
      </p>

      <hr style="border: none; height: 1px; background: #e2e8f0; margin: 28px 0;">

      <div style="text-align: center; color: #64748b; font-size: 12px;">
        <p style="margin: 0;"><strong>Forklift Certified</strong> — OSHA-aligned forklift operator certification</p>
        <p style="margin: 4px 0 0 0;">getforkliftcertified.com · ${GFC_SUPPORT_EMAIL}</p>
        <p style="margin: 12px 0 0 0;">Training meets OSHA 29 CFR 1910.178 requirements.</p>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}
