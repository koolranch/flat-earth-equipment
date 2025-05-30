import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import QRCode from 'qrcode'

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
      
      // Generate PDF certificate
      const pdfBytes = await buildCertPDF({
        certId,
        userName,
        courseName: enrollment.course.title,
        completionDate: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
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

async function buildCertPDF({
  certId,
  userName,
  courseName,
  completionDate
}: {
  certId: string
  userName: string
  courseName: string
  completionDate: string
}) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([792, 612]) // Letter landscape
  
  // Load fonts
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  
  // Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width: 792,
    height: 612,
    color: rgb(1, 1, 1)
  })
  
  // Border
  page.drawRectangle({
    x: 30,
    y: 30,
    width: 732,
    height: 552,
    borderColor: rgb(0.8, 0.4, 0),
    borderWidth: 2
  })
  
  // Title
  page.drawText('Certificate of Completion', {
    x: 396,
    y: 480,
    size: 36,
    font: helveticaBold,
    color: rgb(0, 0.2, 0.6)
  })
  
  // Center text helper
  const centerText = (text: string, y: number, font: any, size: number) => {
    const textWidth = font.widthOfTextAtSize(text, size)
    return 396 - (textWidth / 2)
  }
  
  // This certifies that
  const certText = 'This certifies that'
  page.drawText(certText, {
    x: centerText(certText, 420, helvetica, 18),
    y: 420,
    size: 18,
    font: helvetica,
    color: rgb(0.2, 0.2, 0.2)
  })
  
  // Name
  page.drawText(userName, {
    x: centerText(userName, 370, helveticaBold, 28),
    y: 370,
    size: 28,
    font: helveticaBold,
    color: rgb(0, 0, 0)
  })
  
  // Has successfully completed
  const completeText = 'has successfully completed'
  page.drawText(completeText, {
    x: centerText(completeText, 320, helvetica, 18),
    y: 320,
    size: 18,
    font: helvetica,
    color: rgb(0.2, 0.2, 0.2)
  })
  
  // Course name
  page.drawText(courseName, {
    x: centerText(courseName, 270, helveticaBold, 24),
    y: 270,
    size: 24,
    font: helveticaBold,
    color: rgb(0, 0.2, 0.6)
  })
  
  // Date
  page.drawText(completionDate, {
    x: centerText(completionDate, 200, helvetica, 16),
    y: 200,
    size: 16,
    font: helvetica,
    color: rgb(0.2, 0.2, 0.2)
  })
  
  // Certificate ID
  page.drawText(`Certificate ID: ${certId}`, {
    x: 60,
    y: 100,
    size: 12,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.4)
  })
  
  // QR Code
  const qrCodeDataUrl = await QRCode.toDataURL(
    `https://www.flatearthequipment.com/verify/${certId}`,
    { width: 120, margin: 0 }
  )
  const qrImage = await pdfDoc.embedPng(qrCodeDataUrl)
  page.drawImage(qrImage, {
    x: 620,
    y: 60,
    width: 120,
    height: 120
  })
  
  // Flat Earth Safety logo/text
  page.drawText('Flat Earth Safety™', {
    x: 60,
    y: 520,
    size: 20,
    font: helveticaBold,
    color: rgb(0.8, 0.4, 0)
  })
  
  return await pdfDoc.save()
} 