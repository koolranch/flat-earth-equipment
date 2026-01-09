/**
 * NEW ENDPOINT: Send notification to EXISTING users who make additional purchases
 * 
 * This is completely separate from the welcome email flow.
 * It only sends a notification - it does NOT:
 * - Create users
 * - Change passwords
 * - Modify any database records
 * 
 * Safe to fail - wrapped in try/catch in webhook
 */

import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      email, 
      name, 
      courseTitle, 
      seatCount,
      isTrainer 
    } = body;

    if (!email) {
      return NextResponse.json({ ok: false, error: 'missing_email' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.flatearthequipment.com';
    const firstName = (name || 'there').split(' ')[0];
    
    // Generate the appropriate email based on whether it's a trainer (multi-seat) purchase
    const html = isTrainer 
      ? generateTrainerNotificationEmail(firstName, email, courseTitle, seatCount, siteUrl)
      : generateLearnerNotificationEmail(firstName, email, courseTitle, siteUrl);

    const subject = isTrainer 
      ? `🎓 Your Team Training Purchase is Ready (${seatCount} seats)`
      : `🎓 Your Training Purchase is Ready`;

    const { error } = await resend.emails.send({
      from: 'Flat Earth Equipment <training@flatearthequipment.com>',
      to: email,
      subject,
      html
    });

    if (error) {
      console.error('❌ Failed to send enrollment notification:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    console.log(`✅ Enrollment notification sent to ${email}`);
    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('❌ Error in send-enrollment-notification:', error);
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 });
  }
}

/**
 * Email for trainers (multi-seat purchases) - existing users
 */
function generateTrainerNotificationEmail(
  firstName: string, 
  email: string, 
  courseTitle: string, 
  seatCount: number,
  siteUrl: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Team Training Purchase</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 28px;">🎓 New Training Purchase!</h1>
    <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">${seatCount} Additional Training Seats</p>
  </div>
  
  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #1f2937; margin-top: 0;">Hi ${firstName}!</h2>
    <p>Great news! Your purchase of <strong>${seatCount} training seats</strong> for <strong>${courseTitle}</strong> is complete.</p>
    <p>Since you already have an account, you can access your Trainer Dashboard right away using your existing login credentials.</p>
  </div>
  
  <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
    <h3 style="color: #1e40af; margin-top: 0;">🚀 Access Your Dashboard</h3>
    <p style="margin-bottom: 15px;">Your new seats are ready to assign to your team members.</p>
    <a href="${siteUrl}/trainer/dashboard" 
       style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold;">
      📊 Open Trainer Dashboard
    </a>
  </div>
  
  <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
    <h4 style="margin: 0 0 10px 0; color: #047857;">💡 Quick Reminder</h4>
    <p style="margin: 0; font-size: 14px; color: #065f46;">
      Log in with your existing email (<strong>${email}</strong>) and password. 
      If you've forgotten your password, use the "Forgot Password" link on the login page.
    </p>
  </div>
  
  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
    <h4 style="margin: 0 0 10px 0; color: #92400e;">💬 Need Help?</h4>
    <p style="margin: 0; font-size: 14px; color: #92400e;">
      Questions about your purchase? Reply to this email and we'll respond within 24 hours.
    </p>
  </div>
  
  <hr style="border: none; height: 1px; background: #e5e7eb; margin: 30px 0;">
  
  <div style="text-align: center; color: #6b7280; font-size: 12px;">
    <p><strong>Flat Earth Equipment</strong> | OSHA-Compliant Training Solutions</p>
    <p>flatearthequipment.com | training@flatearthequipment.com</p>
  </div>
</body>
</html>
  `;
}

/**
 * Email for individual learners - existing users making another purchase
 */
function generateLearnerNotificationEmail(
  firstName: string, 
  email: string, 
  courseTitle: string, 
  siteUrl: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Training Purchase</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 28px;">🎓 Training Purchase Complete!</h1>
  </div>
  
  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #1f2937; margin-top: 0;">Hi ${firstName}!</h2>
    <p>Your purchase of <strong>${courseTitle}</strong> is complete.</p>
    <p>Since you already have an account, you can start your training right away using your existing login credentials.</p>
  </div>
  
  <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
    <h3 style="color: #1e40af; margin-top: 0;">🚀 Start Training</h3>
    <p style="margin-bottom: 15px;">Your course is ready and waiting for you.</p>
    <a href="${siteUrl}/training/forklift" 
       style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold;">
      📚 Start Training Now
    </a>
  </div>
  
  <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
    <h4 style="margin: 0 0 10px 0; color: #047857;">💡 Quick Reminder</h4>
    <p style="margin: 0; font-size: 14px; color: #065f46;">
      Log in with your existing email (<strong>${email}</strong>) and password. 
      If you've forgotten your password, use the "Forgot Password" link on the login page.
    </p>
  </div>
  
  <hr style="border: none; height: 1px; background: #e5e7eb; margin: 30px 0;">
  
  <div style="text-align: center; color: #6b7280; font-size: 12px;">
    <p><strong>Flat Earth Equipment</strong> | OSHA-Compliant Training Solutions</p>
    <p>flatearthequipment.com | training@flatearthequipment.com</p>
  </div>
</body>
</html>
  `;
}

