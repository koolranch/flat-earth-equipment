import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/email/mailer';

const ADMIN_TO = process.env.LEADS_TO_EMAIL; // e.g., 'sales@flatearthequipment.com'

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email, name, phone, zip, model, serial, fault_code, notes,
      brand_slug, hp, startedAt
    } = body || {};

    // Basic validation
    if (!email || !brand_slug) {
      return NextResponse.json({ ok: false, error: 'Missing email or brand' }, { status: 400 });
    }

    if (!notes || notes.trim().length < 5) {
      return NextResponse.json({ ok: false, error: 'Please describe what parts you need' }, { status: 400 });
    }

    // Honeypot check - if filled, silently accept (likely bot)
    if (hp && String(hp).trim() !== '') {
      console.log('Honeypot triggered, silently accepting');
      return NextResponse.json({ ok: true });
    }

    // Dwell-time check - prevent too-fast submissions (likely bot)
    const minMillis = 3000; // 3 seconds minimum
    const now = Date.now();
    if (!startedAt || (now - Number(startedAt)) < minMillis) {
      console.log('Fast submit detected, silently accepting');
      return NextResponse.json({ ok: true });
    }

    // Send email notifications directly (same system as certification emails)
    const brandDisplay = brand_slug.charAt(0).toUpperCase() + brand_slug.slice(1);
    
    try {
      // Build admin notification email (HTML)
      const adminSubject = `Parts Lead — ${brandDisplay}${model ? ' ' + model : ''}${serial ? ' / ' + serial : ''}`;
      const adminHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Parts Lead</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="margin: 0; font-size: 20px;">🔧 New Parts Request</h1>
    <p style="margin: 5px 0 0 0; opacity: 0.9;">${brandDisplay} Equipment</p>
  </div>
  
  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="margin-top: 0; color: #1f2937;">Contact Information</h2>
    <p><strong>Email:</strong> ${email}</p>
    ${name ? `<p><strong>Name:</strong> ${name}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
    ${zip ? `<p><strong>ZIP:</strong> ${zip}</p>` : ''}
  </div>

  <div style="background: white; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="margin-top: 0; color: #1f2937;">Equipment Details</h2>
    ${model ? `<p><strong>Model:</strong> ${model}</p>` : '<p><em>Model not provided</em></p>'}
    ${serial ? `<p><strong>Serial:</strong> ${serial}</p>` : '<p><em>Serial not provided</em></p>'}
    ${fault_code ? `<p><strong>Fault Code:</strong> ${fault_code}</p>` : ''}
  </div>

  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px;">
    <h3 style="margin-top: 0; color: #92400e;">Parts Needed:</h3>
    <p style="margin: 0; white-space: pre-wrap;">${notes}</p>
  </div>

  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
    <p>Submitted: ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>`;

      // Build customer confirmation email (HTML)
      const customerSubject = `We received your parts request (${brandDisplay})`;
      const customerHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Parts Request Received</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 24px;">✅ Request Received</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">We'll get back to you within 24 hours</p>
  </div>
  
  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <p style="font-size: 16px; margin-top: 0;">Thanks for reaching out about <strong>${brandDisplay}</strong> parts!</p>
    <p>We received your request and our parts team will follow up within 24 hours with pricing and availability.</p>
  </div>

  <div style="background: white; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="margin-top: 0; color: #1f2937;">Your Request Details:</h3>
    ${model ? `<p><strong>Model:</strong> ${model}</p>` : ''}
    ${serial ? `<p><strong>Serial:</strong> ${serial}</p>` : ''}
    ${fault_code ? `<p><strong>Fault Code:</strong> ${fault_code}</p>` : ''}
    <p><strong>Parts needed:</strong></p>
    <p style="white-space: pre-wrap; background: #f9fafb; padding: 10px; border-radius: 4px;">${notes}</p>
  </div>

  <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
    <p style="margin: 0; font-weight: bold; color: #1e40af;">Need immediate assistance?</p>
    <p style="margin: 5px 0 0 0;">Reach us at <a href="mailto:contact@flatearthequipment.com" style="color: #1e40af; text-decoration: none; font-weight: bold;">contact@flatearthequipment.com</a> or use our <a href="https://www.flatearthequipment.com/contact" style="color: #1e40af; text-decoration: underline; font-weight: bold;">contact form</a>.</p>
  </div>

  <hr style="border: none; height: 1px; background: #e5e7eb; margin: 30px 0;">
  
  <div style="text-align: center; color: #6b7280; font-size: 12px;">
    <p>Flat Earth Equipment | Built Western Tough</p>
    <p><a href="https://www.flatearthequipment.com" style="color: #6b7280; text-decoration: none;">flatearthequipment.com</a> | <a href="mailto:contact@flatearthequipment.com" style="color: #6b7280; text-decoration: none;">contact@flatearthequipment.com</a></p>
  </div>
</body>
</html>`;

      // Send notification to admin
      if (ADMIN_TO) {
        const adminResult = await sendMail({
          to: ADMIN_TO,
          subject: adminSubject,
          html: adminHtml
        });
        
        if (!adminResult.ok) {
          console.error('Failed to send admin notification:', adminResult);
        }
      }
      
      // Send acknowledgment to customer
      const customerResult = await sendMail({
        to: email,
        subject: customerSubject,
        html: customerHtml
      });

      if (!customerResult.ok) {
        console.error('Failed to send customer confirmation:', customerResult);
        return NextResponse.json({ 
          ok: false, 
          error: 'Failed to send confirmation email. Please email contact@flatearthequipment.com or use https://www.flatearthequipment.com/contact for assistance.' 
        }, { status: 500 });
      }

      console.log(`✅ Sent parts lead emails for ${brand_slug}`);
      return NextResponse.json({ ok: true });

    } catch (emailError: any) {
      console.error('Email send error:', emailError);
      return NextResponse.json({ 
        ok: false, 
        error: 'Failed to send email. Please email contact@flatearthequipment.com or use https://www.flatearthequipment.com/contact for assistance.' 
      }, { status: 500 });
    }

  } catch (e: any) {
    console.error('Parts lead API error:', e);
    return NextResponse.json({ 
      ok: false, 
      error: e.message || 'Server error' 
    }, { status: 500 });
  }
}