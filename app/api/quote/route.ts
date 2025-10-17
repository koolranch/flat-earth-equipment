import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/email/mailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      company,
      email,
      phone,
      equipment,
      part,
      qty,
      notes
    } = body;

    // Validate required fields
    if (!name || !email || !part) {
      return NextResponse.json(
        { error: 'Name, email, and part description are required' },
        { status: 400 }
      );
    }

    // Email to your team
    const subject = `Quote Request from ${name}${company ? ` (${company})` : ''}`;
    
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Quote Request</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #A0522D 0%, #8B4513 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 24px;">New Quote Request</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Parts & Equipment Quote</p>
  </div>
  
  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #1f2937; margin-top: 0;">Customer Information</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Name:</td>
        <td style="padding: 8px 0;">${name}</td>
      </tr>
      ${company ? `
      <tr>
        <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Company:</td>
        <td style="padding: 8px 0;">${company}</td>
      </tr>
      ` : ''}
      <tr>
        <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Email:</td>
        <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #A0522D;">${email}</a></td>
      </tr>
      ${phone ? `
      <tr>
        <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Phone:</td>
        <td style="padding: 8px 0;"><a href="tel:${phone}" style="color: #A0522D;">${phone}</a></td>
      </tr>
      ` : ''}
    </table>
  </div>
  
  <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #A0522D;">
    <h2 style="color: #1f2937; margin-top: 0;">Request Details</h2>
    ${equipment ? `<p><strong>Equipment:</strong> ${equipment}</p>` : ''}
    <p><strong>Part:</strong> ${part}</p>
    ${qty ? `<p><strong>Quantity:</strong> ${qty}</p>` : ''}
    ${notes ? `
    <div style="margin-top: 15px;">
      <strong>Additional Notes:</strong>
      <p style="margin: 5px 0 0 0; padding: 10px; background: white; border-radius: 4px;">${notes}</p>
    </div>
    ` : ''}
  </div>
  
  <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
    <p style="margin: 0; font-size: 14px; color: #1e40af;">
      <strong>Action Required:</strong> Review this quote request and respond to the customer within 24 hours.
    </p>
  </div>
  
  <hr style="border: none; height: 1px; background: #e5e7eb; margin: 30px 0;">
  
  <div style="text-align: center; color: #6b7280; font-size: 12px;">
    <p>Flat Earth Equipment | Western-Tough Parts & Rentals</p>
    <p>flatearthequipment.com | (307) 302-0043</p>
  </div>
</body>
</html>
    `;

    // Send email using Resend (same as certification emails)
    await sendMail({
      to: 'quotes@flatearthequipment.com', // Your team email
      subject,
      html: emailHtml
    });

    console.log('✅ Quote request email sent to team:', email);

    return NextResponse.json({ 
      success: true, 
      message: 'Quote request sent successfully' 
    });

  } catch (error) {
    console.error('Quote submission error:', error);
    return NextResponse.json(
      { error: 'Failed to send quote request' },
      { status: 500 }
    );
  }
}

