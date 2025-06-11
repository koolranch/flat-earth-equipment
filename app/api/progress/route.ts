import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { generateCertificate } from '@/lib/cert/generateCertificate'

export async function POST(req: Request) {
  try {
    const { enrollmentId, moduleOrder } = await req.json()
    console.log('Progress API called:', { enrollmentId, moduleOrder })
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get enrollment with course and modules info
    const { data: enrollment, error: enrollError } = await supabase
      .from('enrollments')
      .select(`
        *,
        course:courses(
          id,
          title,
          modules(id, order)
        )
      `)
      .eq('id', enrollmentId)
      .single()

    if (enrollError) {
      console.error('Enrollment query error:', enrollError)
      return NextResponse.json({ error: 'Enrollment not found', details: enrollError.message }, { status: 404 })
    }
    
    if (!enrollment) {
      console.error('No enrollment found for ID:', enrollmentId)
      return NextResponse.json({ error: 'Enrollment not found', enrollmentId }, { status: 404 })
    }

    // Get user data separately
    let userName = 'Student'
    if (enrollment.user_id) {
      const { data: userData } = await supabase
        .auth.admin.getUserById(enrollment.user_id)
      
      if (userData?.user) {
        userName = userData.user.user_metadata?.full_name || userData.user.email || 'Student'
      }
    }

    // Calculate new progress
    const modulesCount = enrollment.course.modules.length
    const newPct = Math.min(100, (moduleOrder / modulesCount) * 100)
    console.log(`Updating progress: ${modulesCount} modules, module ${moduleOrder} completed = ${newPct}%`)
    
    // Update progress
    const { error: updateError } = await supabase
      .from('enrollments')
      .update({ 
        progress_pct: newPct,
        updated_at: new Date().toISOString()
      })
      .eq('id', enrollmentId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json({ error: 'Failed to update progress', details: updateError }, { status: 500 })
    }

    // If course completed, generate certificate
    if (newPct === 100) {
      const certId = crypto
        .createHmac('sha256', process.env.PDF_SECRET_SALT || 'default-salt')
        .update(enrollmentId)
        .digest('hex')
        .slice(0, 12)
        .toUpperCase()
      
      // Generate PDF certificate using modern generator
      const pdfBytes = await generateCertificate({
        certId,
        student: userName,
        course: enrollment.course.title,
        completedAt: new Date().toISOString()
      })
      
      // Upload to Supabase storage
      const fileName = `${certId}.pdf`
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('certs')
        .upload(fileName, pdfBytes, {
          contentType: 'application/pdf',
          upsert: true
        })

      if (uploadError) {
        console.error('Certificate upload error:', uploadError)
        return NextResponse.json({ error: 'Failed to upload certificate' }, { status: 500 })
      }

      // Create a signed URL that expires in 3 years
      const threeYearsInSeconds = 3 * 365 * 24 * 60 * 60
      const { data: signedUrlData, error: signedUrlError } = await supabase
        .storage
        .from('certs')
        .createSignedUrl(fileName, threeYearsInSeconds)
      
      if (signedUrlError) {
        console.error('Error creating signed URL:', signedUrlError)
        return NextResponse.json({ error: 'Failed to create certificate URL' }, { status: 500 })
      }

      // Update enrollment with certificate info
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 3) // 3 years validity
      
      await supabase
        .from('enrollments')
        .update({ 
          passed: true, 
          cert_url: signedUrlData.signedUrl,
          expires_at: expiresAt.toISOString()
        })
        .eq('id', enrollmentId)
    }

    return NextResponse.json({ progress: newPct })
  } catch (error) {
    console.error('Progress API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

 