import { NextResponse } from 'next/server'
import { sendMail } from '@/lib/email/mailer'

function generateTrainerWelcomeEmail(firstName: string, email: string, password: string, courseTitle: string, seatCount: number): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flatearthequipment.com';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Your Team Training Package</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px;">🎓 Your Team Training is Ready!</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">${seatCount} Training Seats for Your Team</p>
      </div>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">Hi ${firstName}!</h2>
        <p>Your purchase is complete! You've successfully purchased <strong>${seatCount} training seats</strong> for <strong>${courseTitle}</strong>.</p>
        <p>As a trainer, you can now assign these seats to your team members and track their progress.</p>
      </div>
      
      <!-- Login Credentials -->
      <div style="background: #f0fdf4; border: 2px solid #059669; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #059669; margin-top: 0;">🔐 Your Trainer Account</h3>
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Password:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 14px;">${password}</code></p>
        </div>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">
          💡 You can change your password anytime after logging in.
        </p>
      </div>
      
      <!-- Getting Started Steps -->
      <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #1e40af; margin-top: 0;">🚀 Getting Started (3 Easy Steps)</h3>
        
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #3b82f6;">
          <h4 style="margin: 0 0 10px 0; color: #1e40af;">Step 1: Access Your Trainer Dashboard</h4>
          <p style="margin: 0 0 10px 0; font-size: 14px;">Log in and go to your trainer dashboard to manage your team's training.</p>
          <a href="${siteUrl}/trainer/dashboard" 
             style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold; margin-top: 5px;">
            📊 Open Trainer Dashboard
          </a>
        </div>
        
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #8b5cf6;">
          <h4 style="margin: 0 0 10px 0; color: #6b21a8;">Step 2: Assign Seats to Your Team</h4>
          <p style="margin: 0; font-size: 14px;">Enter your team members' email addresses and send them personalized invitations. You can assign all ${seatCount} seats now or add team members later.</p>
        </div>
        
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #10b981;">
          <h4 style="margin: 0 0 10px 0; color: #047857;">Step 3: Track Progress</h4>
          <p style="margin: 0; font-size: 14px;">Monitor each team member's training progress, completion status, and download certificates when they pass.</p>
        </div>
      </div>
      
      <!-- Trainer Dashboard Features -->
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #1f2937; margin-top: 0;">📋 Your Trainer Dashboard Features</h3>
        <ul style="margin: 0; padding-left: 20px; color: #374151;">
          <li style="margin-bottom: 8px;"><strong>Seat Management:</strong> Assign and reassign training seats</li>
          <li style="margin-bottom: 8px;"><strong>Email Invitations:</strong> Automatic invites sent to team members</li>
          <li style="margin-bottom: 8px;"><strong>Progress Tracking:</strong> See who's started, in progress, or completed</li>
          <li style="margin-bottom: 8px;"><strong>Certificate Downloads:</strong> Access all team certificates in one place</li>
          <li style="margin-bottom: 8px;"><strong>Export Reports:</strong> Download CSV reports for compliance records</li>
        </ul>
      </div>
      
      <!-- What Team Members Get -->
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #92400e;">📧 What Your Team Members Will Receive</h4>
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          When you assign a seat, each team member receives an email with a personal link to claim their training access. 
          They'll get instant access to the full OSHA-compliant forklift certification course.
        </p>
      </div>
      
      <!-- About the Training -->
      <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #1d4ed8;">📚 About the Training</h4>
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #1e40af;">Each training seat includes:</p>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #1e40af;">
          <li style="margin-bottom: 5px;">5 comprehensive OSHA-compliant training modules</li>
          <li style="margin-bottom: 5px;">Interactive quizzes and knowledge assessments</li>
          <li style="margin-bottom: 5px;">Final certification exam (unlimited retakes)</li>
          <li style="margin-bottom: 5px;">QR-verifiable certificate (valid for 3 years)</li>
          <li style="margin-bottom: 5px;">Employer evaluation forms and guidance</li>
        </ul>
      </div>
      
      <!-- Trainer Can Take Course Too -->
      <div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 6px; padding: 15px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #047857;">💡 Pro Tip</h4>
        <p style="margin: 0; font-size: 14px; color: #065f46;">
          As a trainer, you can also take the course yourself! This is a great way to preview the content and 
          better support your team. You'll still have full access to assign all ${seatCount} seats to your team.
        </p>
      </div>
      
      <!-- Support Information -->
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #92400e;">💬 Need Help?</h4>
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          Questions about managing your team's training? Reply to this email and we'll respond within 24 hours. 
          We're here to help you get your team certified!
        </p>
      </div>
      
      <hr style="border: none; height: 1px; background: #e5e7eb; margin: 30px 0;">
      
      <div style="text-align: center; color: #6b7280; font-size: 12px;">
        <p><strong>Flat Earth Safety™</strong> | OSHA-Compliant Training Solutions</p>
        <p>flatearthequipment.com | training@flatearthequipment.com</p>
        <p style="margin-top: 15px;">This training meets OSHA 29 CFR 1910.178 requirements</p>
      </div>
    </body>
    </html>
  `;
}

export async function POST(req: Request) {
  try {
    const { email, name, password, courseTitle, isTrainer, seatCount } = await req.json()
    
    if (!email || !password || !courseTitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const firstName = name ? name.split(' ')[0] : 'there'
    
    // Use trainer email template for multi-seat purchases
    if (isTrainer && seatCount && seatCount > 1) {
      const trainerEmailHtml = generateTrainerWelcomeEmail(firstName, email, password, courseTitle, seatCount);
      
      await sendMail({
        to: email,
        subject: `🎓 Welcome ${firstName}! Your ${seatCount}-Seat Training Package is Ready`,
        html: trainerEmailHtml
      })
      
      console.log('✅ Trainer welcome email sent via Resend to:', email)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Trainer welcome email sent successfully'
      })
    }
    
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
          Questions about your training? Reply to this email and we'll respond within 24 hours. 
          We're here to help you succeed!
        </p>
      </div>
      
      <hr style="border: none; height: 1px; background: #e5e7eb; margin: 30px 0;">
      
      <div style="text-align: center; color: #6b7280; font-size: 12px;">
        <p>Flat Earth Safety™ | OSHA-Compliant Training Solutions</p>
        <p>flatearthequipment.com | training@flatearthequipment.com</p>
        <p style="margin-top: 15px;">This training meets OSHA 29 CFR 1910.178 requirements</p>
      </div>
    </body>
    </html>
    `
    
    // Send email using Resend (already configured in environment)
    await sendMail({
      to: email,
      subject: `🎓 Welcome ${firstName}! Your Forklift Training is Ready`,
      html: emailHtml
    })
    
    console.log('✅ Training welcome email sent via Resend to:', email)
    
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