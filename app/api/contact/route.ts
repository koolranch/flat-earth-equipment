// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { readSmsConsent, recordSmsConsent } from '@/lib/sms/recordConsent.server';
import { supabaseService } from '@/lib/supabase/service.server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, zipcode, reason, message, smsConsent } = body;
    const consent = readSmsConsent(smsConsent);
    const phoneValue = typeof phone === 'string' ? phone.trim() : '';

    // Validate required fields
    if (!name || !email || !reason || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    try {
      const svc = supabaseService();
      const { error: saveError } = await svc.from('contact_submissions').insert({
        name: String(name).slice(0, 200),
        email: String(email).toLowerCase().trim(),
        phone: phoneValue || null,
        zipcode: zipcode || null,
        reason: reason || null,
        message: typeof message === 'string' ? message.slice(0, 5000) : null,
        sms_consent: consent.sms_consent,
        sms_consent_at: consent.sms_consent_at,
      });
      if (saveError) console.error('contact submission save failed', saveError.message);
    } catch (saveErr) {
      console.error('contact submission save failed', saveErr);
    }

    await recordSmsConsent({
      source: 'contact',
      name: String(name),
      email: String(email),
      phone: phoneValue || null,
      sms_consent: consent.sms_consent,
      sms_consent_at: consent.sms_consent_at,
    });

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Flat Earth Equipment <noreply@flatearthequipment.com>',
      to: ['contact@flatearthequipment.com'],
      replyTo: email,
      subject: `Contact Form: ${reason}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>SMS consent:</strong> ${consent.sms_consent ? 'Yes' : 'No'}</p>
        <p><strong>Zip Code:</strong> ${zipcode || 'Not provided'}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
SMS consent: ${consent.sms_consent ? 'Yes' : 'No'}
Zip Code: ${zipcode || 'Not provided'}
Reason: ${reason}

Message:
${message}
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
