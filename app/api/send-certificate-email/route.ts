import { NextResponse } from 'next/server'
import { getUserLocale } from '@/lib/getUserLocale'
import { sendMail } from '@/lib/email/mailer'

export async function POST(req: Request) {
  try {
    const { to, certificateUrl, studentName, enrollmentId } = await req.json()
    const locale = getUserLocale(req)
    
    if (!to || !certificateUrl || !studentName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Generate evaluation wizard URL if enrollmentId is provided
    const evaluationWizardUrl = enrollmentId 
      ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://flatearthequipment.com'}/evaluations/${enrollmentId}`
      : null
    
    // Email HTML template
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Forklift Operator Training Completion</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 24px;">Forklift Operator Training Complete</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">OSHA-Compliant Certification Documentation</p>
      </div>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">Training Completion Notice</h2>
        <p><strong>${studentName}</strong> has successfully completed the OSHA-compliant Forklift Operator Training Program.</p>
        
        <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #1d4ed8;">OSHA Compliance Requirements</p>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Per 29 CFR 1910.178(l)(6), employers must conduct practical evaluation before independent operation.</p>
        </div>
      </div>
      
      <h3 style="color: #1f2937;">Required Documents</h3>
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <div style="margin-bottom: 15px;">
          <h4 style="margin: 0 0 5px 0; color: #059669;">✅ 1. Completion Certificate</h4>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">Formal instruction and knowledge assessment completed</p>
          <a href="${certificateUrl}" style="display: inline-block; margin-top: 8px; background: #059669; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px;">Download Certificate PDF</a>
        </div>
        
        <div>
          <h4 style="margin: 0 0 5px 0; color: #dc2626;">📋 2. Employer Evaluation Checklist</h4>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">Complete practical skills assessment</p>
          
          ${evaluationWizardUrl ? `
          <div style="background: linear-gradient(135deg, #14b8a6 0%, #0f766e 100%); padding: 12px; border-radius: 6px; margin: 8px 0;">
            <p style="margin: 0; color: white; font-size: 13px; font-weight: bold;">📱 NEW: Digital Evaluation Wizard</p>
            <p style="margin: 4px 0 8px 0; color: #a7f3d0; font-size: 12px;">Mobile-friendly with electronic signatures</p>
            <a href="${evaluationWizardUrl}" style="display: inline-block; background: white; color: #0f766e; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: bold;">Complete Digital Evaluation →</a>
          </div>
          ` : ''}
          
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://flatearthequipment.com'}/pdfs/forklift-evaluation-form-v2.4.pdf" style="display: inline-block; margin-top: 8px; background: #dc2626; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px;">Download PDF Form (Alternative)</a>
        </div>
      </div>
      
      <h3 style="color: #1f2937;">Next Steps for Supervisor</h3>
      <ol style="padding-left: 20px;">
        <li style="margin-bottom: 8px;"><strong>Review Certificate:</strong> Verify completion of formal instruction requirements</li>
        ${evaluationWizardUrl ? `
        <li style="margin-bottom: 8px;"><strong>Complete Digital Evaluation:</strong> <a href="${evaluationWizardUrl}" style="color: #0f766e; text-decoration: underline;">Use our mobile-friendly wizard</a> with electronic signatures</li>
        ` : `
        <li style="margin-bottom: 8px;"><strong>Conduct Practical Evaluation:</strong> Use the fillable evaluation checklist to assess on-the-job competency</li>
        <li style="margin-bottom: 8px;"><strong>Complete Documentation:</strong> Fill out and sign the evaluation form</li>
        `}
        <li style="margin-bottom: 8px;"><strong>Authorize Operation:</strong> Upon successful evaluation, authorize independent forklift operation</li>
      </ol>
      
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; color: #92400e;">Important:</p>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #92400e;">OSHA requires both formal instruction AND practical evaluation. The operator cannot work independently until both requirements are met.</p>
      </div>
      
      <hr style="border: none; height: 1px; background: #e5e7eb; margin: 30px 0;">
      
      <div style="text-align: center; color: #6b7280; font-size: 12px;">
        <p>Flat Earth Safety™ | OSHA-Compliant Training Solutions</p>
        <p>flatearthequipment.com | training@flatearthequipment.com</p>
      </div>
    </body>
    </html>
    `
    
    // Send email using Resend
    await sendMail({
      to,
      subject: `Forklift Training Complete - ${studentName}`,
      html: emailHtml
    })
    
    console.log('✅ Certificate email sent via Resend to:', to)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully',
      // In development, include the email content for testing
      ...(process.env.NODE_ENV === 'development' && { emailHtml })
    })
    
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' }, 
      { status: 500 }
    )
  }
} 