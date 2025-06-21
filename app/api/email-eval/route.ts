import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    
    console.log('📧 Processing evaluation email for:', {
      certificateId: payload.certificate_id,
      supervisorEmail: payload.supervisor_email,
      equipmentType: payload.equipment_type,
      checksCount: Object.keys(payload.checks_json || {}).length,
      hasSignature: !!payload.signature_url
    })

    // Get operator information from enrollments if it's a real certificate
    let operatorName = 'Demo Operator'
    let operatorEmail = null
    
    if (!payload.certificate_id.includes('test') && !payload.certificate_id.includes('demo')) {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select(`
          user_id,
          users!inner(email, first_name, last_name)
        `)
        .eq('id', payload.certificate_id)
        .single()
      
      if (enrollment?.users && !Array.isArray(enrollment.users)) {
        const user = enrollment.users as { email: string; first_name: string; last_name: string }
        operatorName = `${user.first_name} ${user.last_name}`.trim()
        operatorEmail = user.email
      }
    }

    // Format evaluation results
    const passedChecks = Object.entries(payload.checks_json || {}).filter(([_, result]) => result === 'pass').length
    const totalChecks = Object.keys(payload.checks_json || {}).length
    const retrainChecks = Object.entries(payload.checks_json || {}).filter(([_, result]) => result === 'retrain')
    const evaluationStatus = retrainChecks.length === 0 ? 'PASSED' : 'REQUIRES RETRAINING'
    const statusColor = evaluationStatus === 'PASSED' ? '#059669' : '#dc2626'

    // Create skills breakdown
    const skillsBreakdown = Object.entries(payload.checks_json || {}).map(([skill, result]) => {
      const statusIcon = result === 'pass' ? '✅' : '🔄'
      const statusText = result === 'pass' ? 'PASS' : 'RETRAIN'
      const statusStyle = result === 'pass' 
        ? 'color: #059669; font-weight: bold;'
        : 'color: #dc2626; font-weight: bold;'
      
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 14px;">
            ${statusIcon} ${skill.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center; ${statusStyle}">
            ${statusText}
          </td>
        </tr>
      `
    }).join('')

    // Email HTML template
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Supervisor Evaluation Completed</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 24px;">Supervisor Evaluation Completed</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">OSHA 29 CFR 1910.178(l)(6) Practical Assessment</p>
      </div>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">Evaluation Summary</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <p style="margin: 5px 0;"><strong>Operator:</strong> ${operatorName}</p>
            <p style="margin: 5px 0;"><strong>Equipment:</strong> ${payload.equipment_type}</p>
            <p style="margin: 5px 0;"><strong>Supervisor:</strong> ${payload.supervisor_email}</p>
          </div>
          <div>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Score:</strong> ${passedChecks}/${totalChecks} Skills</p>
            <p style="margin: 5px 0; ${statusColor === '#059669' ? 'color: #059669;' : 'color: #dc2626;'} font-weight: bold;"><strong>Status:</strong> ${evaluationStatus}</p>
          </div>
        </div>
      </div>
      
      <h3 style="color: #1f2937;">Skills Assessment Results</h3>
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px; overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #e5e7eb; font-size: 14px; color: #6b7280;">Skill Area</th>
              <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #e5e7eb; font-size: 14px; color: #6b7280;">Result</th>
            </tr>
          </thead>
          <tbody>
            ${skillsBreakdown}
          </tbody>
        </table>
      </div>

      ${retrainChecks.length > 0 ? `
      <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h4 style="margin: 0 0 10px 0; color: #dc2626;">⚠️ Retraining Required</h4>
        <p style="margin: 0; font-size: 14px; color: #7f1d1d;">The following skills require additional training before independent operation:</p>
        <ul style="margin: 10px 0 0 0; font-size: 14px; color: #7f1d1d;">
          ${retrainChecks.map(([skill]) => `<li>${skill.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>`).join('')}
        </ul>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #7f1d1d; font-weight: bold;">Operator must receive additional training and pass re-evaluation before authorization.</p>
      </div>
      ` : `
      <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h4 style="margin: 0 0 10px 0; color: #059669;">✅ Evaluation Passed</h4>
        <p style="margin: 0; font-size: 14px; color: #14532d;">All required skills demonstrated successfully. Operator is authorized for independent forklift operation.</p>
      </div>
      `}
      
      ${payload.signature_url ? `
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #1f2937;">📝 Digital Signature Captured</h4>
        <p style="margin: 0; font-size: 14px; color: #6b7280;">Supervisor signature electronically recorded and stored securely.</p>
      </div>
      ` : ''}
      
      <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; color: #1d4ed8;">OSHA Compliance Documentation</p>
        <p style="margin: 5px 0 0 0; font-size: 14px;">This evaluation satisfies the practical assessment requirements of 29 CFR 1910.178(l)(6). Retain this record per OSHA recordkeeping requirements.</p>
      </div>
      
      <hr style="border: none; height: 1px; background: #e5e7eb; margin: 30px 0;">
      
      <div style="text-align: center; color: #6b7280; font-size: 12px;">
        <p>Flat Earth Safety™ | OSHA-Compliant Training Solutions</p>
        <p>flatearthequipment.com | training@flatearthequipment.com | (307) 302-0043</p>
        <p style="margin-top: 15px; font-size: 11px;">This evaluation was completed using our secure digital platform with timestamp: ${new Date().toISOString()}</p>
      </div>
    </body>
    </html>
    `
    
    // Send email using SendGrid
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('⚠️ SENDGRID_API_KEY not configured - email will not be sent')
      console.log('📧 Email would be sent to:', payload.supervisor_email)
      if (operatorEmail) console.log('📧 CC would be sent to operator:', operatorEmail)
    } else {
      const sgMail = await import('@sendgrid/mail').then(m => m.default)
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      
      const subject = `Supervisor Evaluation ${evaluationStatus} - ${operatorName} (${payload.equipment_type})`
      
      // Send to supervisor (primary recipient)
      await sgMail.send({
        to: payload.supervisor_email,
        ...(operatorEmail && { cc: operatorEmail }), // CC operator if available
        from: {
          name: 'Flat Earth Safety Training',
          email: 'training@flatearthequipment.com'
        },
        subject,
        html: emailHtml,
      })
      
      console.log('✅ Evaluation email sent successfully via SendGrid to:', payload.supervisor_email)
      if (operatorEmail) console.log('✅ Operator CC sent to:', operatorEmail)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Evaluation completed and email notification sent successfully',
      status: evaluationStatus,
      score: `${passedChecks}/${totalChecks}`,
      // In development, include the email content for testing
      ...(process.env.NODE_ENV === 'development' && { emailHtml })
    })
    
  } catch (error) {
    console.error('Email eval API error:', error)
    return NextResponse.json(
      { error: 'Failed to process evaluation email' }, 
      { status: 500 }
    )
  }
} 