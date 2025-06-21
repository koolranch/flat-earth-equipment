import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    
    // TODO: Implement PDF merging and email sending
    // For now, this is a stub that logs the payload
    
    console.log('📧 Evaluation email requested:', {
      certificateId: payload.certificate_id,
      supervisorEmail: payload.supervisor_email,
      equipmentType: payload.equipment_type,
      checksCount: Object.keys(payload.checks_json || {}).length,
      hasSignature: !!payload.signature_url
    })
    
    // In the future, this would:
    // 1. Merge evaluation data into PDF using pdf-lib
    // 2. Send email to both operator and supervisor using SendGrid
    // 3. Attach the completed evaluation PDF
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email functionality coming soon. Evaluation has been saved.' 
    })
  } catch (error) {
    console.error('Email eval API error:', error)
    return NextResponse.json(
      { error: 'Failed to process evaluation email' }, 
      { status: 500 }
    )
  }
} 