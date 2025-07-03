import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email, name, password, courseTitle } = await req.json()
    
    if (!email || !password || !courseTitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const firstName = name ? name.split(' ')[0] : 'there'
    
    // Email HTML template for training welcome with login credentials
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Your Forklift Training</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 24px;">🎓 Welcome to Your Training!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your account is ready - start learning immediately</p>
      </div>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">Hi ${firstName}!</h2>
        <p>Your purchase is complete and your training account has been automatically created. You can start your <strong>${courseTitle}</strong> immediately!</p>
      </div>
      
      <!-- Login Credentials -->
      <div style="background: #f0fdf4; border: 2px solid #059669; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #059669; margin-top: 0;">🔐 Your Login Credentials</h3>
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Password:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 14px;">${password}</code></p>
        </div>
        <div style="margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://flatearthequipment.com'}/login" 
             style="display: inline-block; background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
            🚀 Start Training Now
          </a>
        </div>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">
          💡 <strong>Easy to remember:</strong> Your password is simple to type! You can change it anytime after logging in.
        </p>
      </div>
      
      <!-- What's Included -->
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #1f2937; margin-top: 0;">📚 What's Included in Your Training</h3>
        <ul style="margin: 0; padding-left: 20px; color: #374151;">
          <li style="margin-bottom: 8px;">5 comprehensive training modules</li>
          <li style="margin-bottom: 8px;">Interactive quizzes and assessments</li>
          <li style="margin-bottom: 8px;">OSHA-compliant certification upon completion</li>
          <li style="margin-bottom: 8px;">Downloadable certificate (valid for 3 years)</li>
          <li style="margin-bottom: 8px;">Employer evaluation forms and guidance</li>
        </ul>
      </div>
      
      <!-- Training Process -->
      <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #1d4ed8;">🎯 Your Training Process</h4>
        <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #1e40af;">
          <li style="margin-bottom: 5px;">Complete 5 online training modules at your own pace</li>
          <li style="margin-bottom: 5px;">Pass the knowledge assessments (you can retake them)</li>
          <li style="margin-bottom: 5px;">Download your certificate when complete</li>
          <li style="margin-bottom: 5px;">Have your supervisor complete the practical evaluation</li>
          <li style="margin-bottom: 5px;">You're certified and ready to operate safely!</li>
        </ol>
      </div>
      
      <!-- Support Information -->
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #92400e;">💬 Need Help?</h4>
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          Questions about your training? Reply to this email or call us at <strong>(307) 302-0043</strong>. 
          We're here to help you succeed!
        </p>
      </div>
      
      <hr style="border: none; height: 1px; background: #e5e7eb; margin: 30px 0;">
      
      <div style="text-align: center; color: #6b7280; font-size: 12px;">
        <p>Flat Earth Safety™ | OSHA-Compliant Training Solutions</p>
        <p>flatearthequipment.com | training@flatearthequipment.com | (307) 302-0043</p>
        <p style="margin-top: 15px;">This training meets OSHA 29 CFR 1910.178 requirements</p>
      </div>
    </body>
    </html>
    `
    
    // Send email using SendGrid
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('⚠️ SENDGRID_API_KEY not configured - email will not be sent')
      console.log('📧 Training welcome email would be sent to:', email)
      console.log('📧 Password:', password)
    } else {
      const sgMail = await import('@sendgrid/mail').then(m => m.default)
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      
      await sgMail.send({
        to: email,
        from: {
          name: 'Flat Earth Safety Training',
          email: 'training@flatearthequipment.com'
        },
        subject: `🎓 Welcome ${firstName}! Your Forklift Training is Ready`,
        html: emailHtml,
      })
      
      console.log('✅ Training welcome email sent successfully via SendGrid to:', email)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Training welcome email sent successfully'
    })
    
  } catch (error) {
    console.error('Training welcome email error:', error)
    return NextResponse.json(
      { error: 'Failed to send training welcome email' }, 
      { status: 500 }
    )
  }
} 