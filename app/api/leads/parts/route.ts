import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
const ADMIN_TO = process.env.LEADS_TO_EMAIL; // e.g., 'sales@flatearthequipment.com'
const FROM = process.env.LEADS_FROM_EMAIL || 'noreply@flatearthequipment.com';
const SENDGRID_KEY = process.env.SENDGRID_API_KEY || '';

// Dynamic import to avoid build issues if @sendgrid/mail is not installed
let sgMail: any = null;
if (SENDGRID_KEY) {
  try {
    sgMail = await import('@sendgrid/mail').then(m => m.default);
    sgMail.setApiKey(SENDGRID_KEY);
  } catch (e) {
    console.warn('SendGrid not available:', e);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email, name, phone, zip, model, serial, fault_code, notes,
      brand_slug, page_source, utm_source, utm_medium, utm_campaign,
      hp, startedAt
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

    const supabase = supabaseService();

    // Insert lead into database
    const leadData = {
      brand_slug,
      equipment_type: null, // Will be added later if needed
      model: model || null,
      serial_number: serial || null,
      part_description: notes,
      contact_name: name || null,
      contact_email: email,
      contact_phone: phone || null,
      company_name: null, // Not collected in this form
      notes: fault_code ? `Fault Code: ${fault_code}\n\n${notes}` : notes,
      urgency: 'medium',
      status: 'new',
      user_agent: req.headers.get('user-agent') || null,
      ip_address: req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || null,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null
    };

    const { error } = await supabase.from('parts_leads').insert([leadData]);
    if (error) {
      console.error('Database insert error:', error);
      throw error;
    }

    // Email notifications (best-effort, don't fail if email fails)
    if (sgMail) {
      try {
        const subject = `Parts Lead — ${brand_slug}${model ? ' ' + model : ''}${serial ? ' / ' + serial : ''}`;
        const adminText = `New parts lead for ${brand_slug}

Email: ${email}
Name: ${name || 'Not provided'}
Phone: ${phone || 'Not provided'}
ZIP: ${zip || 'Not provided'}
Model: ${model || 'Not provided'}
Serial: ${serial || 'Not provided'}
Fault Code: ${fault_code || 'None'}

Parts Needed:
${notes}

Submitted: ${new Date().toLocaleString()}`;

        const customerText = `Thanks for reaching out about ${brand_slug} parts!

We received your request and our team will follow up within 24 hours with pricing and availability.

Your request details:
${model ? `Model: ${model}` : ''}
${serial ? `Serial: ${serial}` : ''}
${fault_code ? `Fault Code: ${fault_code}` : ''}

Parts needed: ${notes}

Need immediate assistance? Call us at (307) 302-0043.

Best regards,
Flat Earth Equipment Team`;

        const emails: any[] = [];
        
        // Send notification to admin
        if (ADMIN_TO) {
          emails.push({ 
            to: ADMIN_TO, 
            from: FROM, 
            subject, 
            text: adminText 
          });
        }
        
        // Send acknowledgment to customer
        emails.push({ 
          to: email, 
          from: FROM, 
          subject: `We received your parts request (${brand_slug})`, 
          text: customerText 
        });

        if (emails.length > 0) {
          await sgMail.send(emails);
          console.log(`Sent ${emails.length} email(s) for parts lead`);
        }
      } catch (emailError) {
        // Don't fail the request if email fails
        console.error('Email send error (non-fatal):', emailError);
      }
    } else {
      console.log('SendGrid not configured, skipping email notifications');
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Parts lead API error:', e);
    return NextResponse.json({ 
      ok: false, 
      error: e.message || 'Server error' 
    }, { status: 500 });
  }
}