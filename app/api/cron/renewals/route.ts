import { Resend } from 'resend'
import { supabaseService } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

interface RenewalRow {
  enrollment_id: string
  email: string
  expires_at: string
}

export async function GET(request: Request) {
  try {
    // Verify cron secret if provided
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = supabaseService()
    
    const { data: soon, error: dbError } = await supabase.rpc('get_renewals_due')
    
    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!soon || soon.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No renewals due' })
    }

    const resend = new Resend(process.env.RESEND_API_KEY!)
    const results = []
    
    for (const row of soon as RenewalRow[]) {
      try {
        const { data, error } = await resend.emails.send({
          from: 'Flat Earth Safety <training@flatearthequipment.com>',
          to: row.email,
          subject: 'Time to renew your forklift certification',
          html: `
            <p>Hi there!</p>
            <p>Your forklift certification expires on <strong>${new Date(row.expires_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</strong>.</p>
            <p>Stay compliant with OSHA regulations by completing your refresher training.</p>
            <p><a href="https://www.flatearthequipment.com/safety?renew=${row.enrollment_id}" 
                style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Complete $35 Refresher Course
            </a></p>
            <p>If you have any questions, please don't hesitate to reach out.</p>
            <p>Best regards,<br>Flat Earth Safety Team</p>`
        })
        
        if (error) {
          console.error(`Failed to send email to ${row.email}:`, error)
          results.push({ email: row.email, success: false, error: error.message })
        } else {
          results.push({ email: row.email, success: true, id: data?.id })
        }
      } catch (err) {
        console.error(`Error sending to ${row.email}:`, err)
        results.push({ email: row.email, success: false, error: 'Send failed' })
      }
    }
    
    const successCount = results.filter(r => r.success).length
    return NextResponse.json({ 
      sent: successCount, 
      total: soon.length,
      results 
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 