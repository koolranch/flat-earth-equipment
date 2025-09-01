import 'server-only';
import { Resend } from 'resend';

const key = process.env.RESEND_API_KEY!;
const from = process.env.EMAIL_FROM || 'Flat Earth Safety <no-reply@flatearthsafety.test>';

interface SendInviteEmailOptions {
  to: string;
  claimUrl: string;
  courseTitle: string;
}

export async function sendInviteEmail(opts: SendInviteEmailOptions) {
  if (!key) {
    throw new Error('Missing RESEND_API_KEY environment variable');
  }
  
  const resend = new Resend(key);
  
  const subject = `You've been invited: ${opts.courseTitle}`;
  const text = `You have been assigned training in ${opts.courseTitle}.

Claim your seat: ${opts.claimUrl}

This training covers OSHA-compliant forklift operator certification with interactive demos, micro-quizzes, and a final exam. Upon completion, you'll receive a QR-verifiable certificate.

If you weren't expecting this invitation, please ignore this email.

---
Flat Earth Safety
Modern Forklift Operator Training`;

  try {
    const result = await resend.emails.send({
      from,
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
export async function sendWelcomeEmail(opts: { to: string; name?: string; courseTitle: string }) {
  if (!key) {
    throw new Error('Missing RESEND_API_KEY environment variable');
  }
  
  const resend = new Resend(key);
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
