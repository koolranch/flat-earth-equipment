import 'server-only';
import { Resend } from 'resend';
import { GFC_EMAIL_FROM } from '@/lib/email/gfcTrainerWelcome';
import type { SourceBrand } from '@/lib/training/sourceBrand';

const key = process.env.RESEND_API_KEY!;
const from = process.env.EMAIL_FROM || 'Flat Earth Safety <no-reply@flatearthequipment.com>';

interface SendInviteEmailOptions {
  to: string;
  claimUrl: string;
  courseTitle: string;
  /** 'gfc' switches sender + copy to Forklift Certified branding. Default: Flat Earth Safety. */
  brand?: SourceBrand;
}

export async function sendInviteEmail(opts: SendInviteEmailOptions) {
  if (!key) {
    throw new Error('Missing RESEND_API_KEY environment variable');
  }
  
  const resend = new Resend(key);
  
  const subject = `You've been invited: ${opts.courseTitle}`;
  const text =
    opts.brand === 'gfc'
      ? `Your employer has assigned you training in ${opts.courseTitle}.

Claim your seat: ${opts.claimUrl}

This OSHA-aligned forklift operator certification takes most operators under 30 minutes on a phone — interactive lessons, quick quizzes, and a final exam, available in English and Spanish. When you pass, you'll get a QR-verifiable certificate valid for 3 years.

If you weren't expecting this invitation, please ignore this email.

---
Forklift Certified
getforkliftcertified.com | support@getforkliftcertified.com`
      : `You have been assigned training in ${opts.courseTitle}.

Claim your seat: ${opts.claimUrl}

This training covers OSHA-compliant forklift operator certification with interactive demos, micro-quizzes, and a final exam. Upon completion, you'll receive a QR-verifiable certificate.

If you weren't expecting this invitation, please ignore this email.

---
Flat Earth Safety
Modern Forklift Operator Training`;

  try {
    const result = await resend.emails.send({
      from: opts.brand === 'gfc' ? GFC_EMAIL_FROM : from,
      to: opts.to,
      subject,
      text,
    });
    
    return result;
  } catch (error) {
    console.error('Failed to send invite email:', error);
    throw error;
  }
}

// Additional email utility functions
export async function sendWelcomeEmail(opts: {
  to: string;
  name?: string;
  courseTitle: string;
  /** 'gfc' switches sender + copy to Forklift Certified branding. Default: Flat Earth Safety. */
  brand?: SourceBrand;
}) {
  if (!key) {
    throw new Error('Missing RESEND_API_KEY environment variable');
  }
  
  const resend = new Resend(key);

  if (opts.brand === 'gfc') {
    const gfcSubject = `Your training seat is ready — ${opts.courseTitle}`;
    const gfcText = `Welcome${opts.name ? ` ${opts.name}` : ''}!

Your seat in ${opts.courseTitle} is claimed and your account is ready.

The fastest way to train is the Forklift Certified app:

iPhone: https://apps.apple.com/app/id6759796469
Android: https://play.google.com/store/apps/details?id=com.flateartheequipment.forkliftcertified

Sign in with this email address and the password you just created. Most operators finish in under 30 minutes — interactive lessons, quick quizzes, and a final exam, in English or Spanish.

Prefer a computer? Train in your browser: https://app.getforkliftcertified.com/training

When you pass, you'll get a QR-verifiable certificate valid for 3 years.

---
Forklift Certified
getforkliftcertified.com | support@getforkliftcertified.com`;

    try {
      return await resend.emails.send({
        from: GFC_EMAIL_FROM,
        to: opts.to,
        subject: gfcSubject,
        text: gfcText,
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }

  const subject = `Welcome to ${opts.courseTitle}`;
  const text = `Welcome ${opts.name || 'to the training'}!

You've successfully enrolled in ${opts.courseTitle}. 

Get started: ${process.env.NEXT_PUBLIC_BASE_URL}/training

This OSHA-compliant training includes:
- Interactive demos and simulations
- Quick knowledge checks
- Final certification exam
- QR-verifiable certificate upon completion

Questions? Contact our support team.

---
Flat Earth Safety
Modern Forklift Operator Training`;

  try {
    return await resend.emails.send({
      from,
      to: opts.to,
      subject,
      text,
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}

export type ReminderType = 'nudge_start' | 'nudge_finish' | 'renewal';

export async function sendTrainingReminderEmail(opts: {
  to: string;
  name?: string;
  courseTitle: string;
  reminderType: ReminderType;
  progressPct?: number;
  expiresAt?: string | null;
  /** 'gfc' switches sender + copy to Forklift Certified branding. Default: Flat Earth Safety. */
  brand?: SourceBrand;
}) {
  if (!key) {
    throw new Error('Missing RESEND_API_KEY environment variable');
  }

  const resend = new Resend(key);
  const isGfc = opts.brand === 'gfc';
  const trainingUrl = isGfc
    ? 'https://app.getforkliftcertified.com/training'
    : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.flatearthequipment.com'}/training`;
  const appBlock = isGfc
    ? `The fastest way to train is the Forklift Certified app:

iPhone: https://apps.apple.com/app/id6759796469
Android: https://play.google.com/store/apps/details?id=com.flateartheequipment.forkliftcertified

Prefer a computer? Train in your browser: ${trainingUrl}`
    : `Continue your training: ${trainingUrl}`;
  const signature = isGfc
    ? `---
Forklift Certified
getforkliftcertified.com | support@getforkliftcertified.com`
    : `---
Flat Earth Safety
Modern Forklift Operator Training`;
  const greeting = `Hi${opts.name ? ` ${opts.name}` : ''},`;

  let subject: string;
  let body: string;
  switch (opts.reminderType) {
    case 'nudge_start':
      subject = `Reminder: start your ${opts.courseTitle} training`;
      body = `${greeting}

Your employer assigned you a seat in ${opts.courseTitle}, and it's ready whenever you are. Most operators finish in under 30 minutes — interactive lessons, quick quizzes, and a final exam, in English or Spanish.

${appBlock}

When you pass, you'll get a QR-verifiable certificate valid for 3 years.`;
      break;
    case 'nudge_finish':
      subject = `You're ${Math.round(opts.progressPct || 0)}% through ${opts.courseTitle} — finish up!`;
      body = `${greeting}

You're ${Math.round(opts.progressPct || 0)}% of the way through ${opts.courseTitle}. Your progress is saved, so you can pick up right where you left off.

${appBlock}

When you pass, you'll get a QR-verifiable certificate valid for 3 years.`;
      break;
    case 'renewal': {
      const expiryLine = opts.expiresAt
        ? `Your ${opts.courseTitle} certification expires on ${new Date(opts.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`
        : `Your ${opts.courseTitle} certification is coming up for renewal.`;
      subject = `Your ${opts.courseTitle} certification is expiring soon`;
      body = `${greeting}

${expiryLine} To stay OSHA-compliant, complete your recertification before it lapses.

${appBlock}`;
      break;
    }
    default: {
      const exhaustive: never = opts.reminderType;
      throw new Error(`Unknown reminder type: ${exhaustive}`);
    }
  }

  const text = `${body}

This reminder was sent by your employer's training manager.

${signature}`;

  try {
    return await resend.emails.send({
      from: isGfc ? GFC_EMAIL_FROM : from,
      to: opts.to,
      subject,
      text,
    });
  } catch (error) {
    console.error('Failed to send training reminder email:', error);
    throw error;
  }
}

export async function sendManagerExpirationDigest(opts: {
  to: string;
  managerName?: string;
  operators: Array<{ name: string; email: string; expiresAt: string; daysLeft: number }>;
  /** 'gfc' switches sender + copy to Forklift Certified branding. Default: Flat Earth Safety. */
  brand?: SourceBrand;
}) {
  if (!key) {
    throw new Error('Missing RESEND_API_KEY environment variable');
  }

  const resend = new Resend(key);
  const isGfc = opts.brand === 'gfc';
  const dashboardUrl = isGfc
    ? 'https://app.getforkliftcertified.com/trainer/dashboard'
    : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.flatearthequipment.com'}/trainer/dashboard`;
  const signature = isGfc
    ? `---
Forklift Certified
getforkliftcertified.com | support@getforkliftcertified.com`
    : `---
Flat Earth Safety
Modern Forklift Operator Training`;

  const lines = opts.operators
    .map(o => {
      const when = o.daysLeft < 0
        ? `expired ${Math.abs(o.daysLeft)} day${Math.abs(o.daysLeft) === 1 ? '' : 's'} ago`
        : `expires in ${o.daysLeft} day${o.daysLeft === 1 ? '' : 's'}`;
      const date = new Date(o.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      return `- ${o.name} (${o.email}) — ${when} (${date})`;
    })
    .join('\n');

  const count = opts.operators.length;
  const subject = `${count} operator certification${count === 1 ? '' : 's'} expiring soon`;
  const text = `Hi${opts.managerName ? ` ${opts.managerName}` : ''},

The following operator certification${count === 1 ? ' is' : 's are'} coming up for renewal. We've sent each operator a renewal reminder — no action is needed unless you want to follow up directly.

${lines}

Review your team: ${dashboardUrl}

${signature}`;

  try {
    return await resend.emails.send({
      from: isGfc ? GFC_EMAIL_FROM : from,
      to: opts.to,
      subject,
      text,
    });
  } catch (error) {
    console.error('Failed to send manager expiration digest:', error);
    throw error;
  }
}

export async function sendCertificateEmail(opts: { to: string; name?: string; pdfUrl: string; verificationCode: string }) {
  if (!key) {
    throw new Error('Missing RESEND_API_KEY environment variable');
  }
  
  const resend = new Resend(key);
  const subject = 'Your Forklift Operator Certificate is Ready';
  const text = `Congratulations ${opts.name || ''}!

Your forklift operator certificate is now available.

Download: ${opts.pdfUrl}
Verification Code: ${opts.verificationCode}
Verify online: ${process.env.NEXT_PUBLIC_BASE_URL}/verify/${opts.verificationCode}

Keep this certificate and verification code for your records. Employers can verify authenticity using the QR code or verification URL.

---
Flat Earth Safety
Modern Forklift Operator Training`;

  try {
    return await resend.emails.send({
      from,
      to: opts.to,
      subject,
      text,
    });
  } catch (error) {
    console.error('Failed to send certificate email:', error);
    throw error;
  }
}

// =============================================================================
// Quote Request Emails
// =============================================================================

const partsFrom = process.env.PARTS_EMAIL_FROM || 'Flat Earth Equipment <parts@flatearthequipment.com>';
const partsNotifyEmail = process.env.PARTS_NOTIFY_EMAIL || 'parts@flatearthequipment.com';

export interface QuoteRequestEmailData {
  requestId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  company?: string | null;
  partName: string;
  oemReference?: string | null;
  quantity: number;
  machineBrand?: string | null;
  machineModel?: string | null;
  machineSerial?: string | null;
  urgency: 'standard' | 'urgent' | 'emergency';
  notes?: string | null;
}

const urgencyLabels = {
  standard: '📦 Standard (3-5 business days)',
  urgent: '⚡ Urgent (1-2 business days)',
  emergency: '🚨 EMERGENCY (Same day if possible)',
};

const urgencySubjectPrefix = {
  standard: '',
  urgent: '[URGENT] ',
  emergency: '[🚨 EMERGENCY] ',
};

/**
 * Send high-priority notification to sales team
 */
export async function sendQuoteNotificationEmail(data: QuoteRequestEmailData) {
  if (!key) {
    console.warn('Missing RESEND_API_KEY - skipping quote notification email');
    return null;
  }
  
  const resend = new Resend(key);
  
  const subject = `${urgencySubjectPrefix[data.urgency]}New OEM Quote Request: ${data.partName}`;
  
  const machineInfo = data.machineBrand && data.machineModel 
    ? `${data.machineBrand} ${data.machineModel}${data.machineSerial ? ` (S/N: ${data.machineSerial})` : ''}`
    : 'Not specified';

  const text = `
═══════════════════════════════════════════════════════════
  NEW OEM QUOTE REQUEST
  Priority: ${urgencyLabels[data.urgency]}
═══════════════════════════════════════════════════════════

PART DETAILS
────────────────────────────────────────
Part Name:     ${data.partName}
OEM Number:    ${data.oemReference || 'N/A'}
Quantity:      ${data.quantity}
Machine:       ${machineInfo}

CUSTOMER INFORMATION
────────────────────────────────────────
Name:          ${data.customerName}
Email:         ${data.customerEmail}
Phone:         ${data.customerPhone || 'Not provided'}
Company:       ${data.company || 'Not provided'}

${data.notes ? `NOTES\n────────────────────────────────────────\n${data.notes}\n` : ''}
────────────────────────────────────────
Request ID: ${data.requestId}
Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/Denver' })} MT

Manage in dashboard: ${process.env.NEXT_PUBLIC_BASE_URL}/admin/quotes/${data.requestId}
`.trim();

  try {
    const result = await resend.emails.send({
      from: partsFrom,
      to: partsNotifyEmail,
      replyTo: data.customerEmail,
      subject,
      text,
    });
    
    console.log('Quote notification email sent:', result);
    return result;
  } catch (error) {
    console.error('Failed to send quote notification email:', error);
    // Don't throw - we don't want email failures to break the request
    return null;
  }
}

/**
 * Send professional confirmation email to customer
 */
export async function sendQuoteConfirmationEmail(data: QuoteRequestEmailData) {
  if (!key) {
    console.warn('Missing RESEND_API_KEY - skipping quote confirmation email');
    return null;
  }
  
  const resend = new Resend(key);
  
  const subject = `We've received your quote request - ${data.partName}`;
  
  const responseTime = data.urgency === 'emergency' 
    ? 'within a few hours' 
    : data.urgency === 'urgent' 
      ? 'within 24 hours' 
      : 'within 1-2 business days';

  const text = `
Hi ${data.customerName},

Thank you for your quote request! We've received your inquiry and our parts team is already working on it.

═══════════════════════════════════════════════════════════
  YOUR REQUEST SUMMARY
═══════════════════════════════════════════════════════════

Part:          ${data.partName}
OEM Number:    ${data.oemReference || 'N/A'}
Quantity:      ${data.quantity}
${data.machineBrand && data.machineModel ? `Machine:       ${data.machineBrand} ${data.machineModel}` : ''}

Priority:      ${urgencyLabels[data.urgency]}
Reference:     #${data.requestId.slice(0, 8).toUpperCase()}

───────────────────────────────────────────────────────────

WHAT HAPPENS NEXT
───────────────────────────────────────────────────────────
1. Our team will verify part availability with our suppliers
2. We'll confirm fitment for your specific equipment
3. You'll receive a detailed quote ${responseTime}

${data.urgency === 'emergency' ? '⚡ Since you marked this as EMERGENCY, we\'re prioritizing your request. For immediate assistance, call us at 1-800-555-1234.\n' : ''}
NEED IMMEDIATE HELP?
───────────────────────────────────────────────────────────
📞 Phone: 1-800-555-1234
📧 Email: parts@flatearthequipment.com

We appreciate your business!

Best regards,
The Flat Earth Equipment Team

───────────────────────────────────────────────────────────
Flat Earth Equipment | Industrial Parts & Solutions
www.flatearthequipment.com
`.trim();

  try {
    const result = await resend.emails.send({
      from: partsFrom,
      to: data.customerEmail,
      subject,
      text,
    });
    
    console.log('Quote confirmation email sent to:', data.customerEmail);
    return result;
  } catch (error) {
    console.error('Failed to send quote confirmation email:', error);
    // Don't throw - we don't want email failures to break the request
    return null;
  }
}
