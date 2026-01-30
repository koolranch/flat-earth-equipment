#!/usr/bin/env tsx
/**
 * Customer Service Script: Regenerate Certificate PDF
 * 
 * Regenerates the certificate PDF with current user profile data
 * 
 * Usage: npx tsx scripts/regenerate-certificate-pdf.ts <verification-code>
 * Example: npx tsx scripts/regenerate-certificate-pdf.ts LGSRX5GVYE
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Generate QR code
async function generateQRCode(text: string): Promise<Buffer> {
  const QRCode = (await import('qrcode')).default;
  return await QRCode.toBuffer(text, {
    width: 200,
    margin: 1,
    errorCorrectionLevel: 'M'
  });
}

async function regenerateCertificatePDF(verificationCode: string) {
  try {
    console.log('🔍 Looking up certificate with verification code:', verificationCode)
    
    // Find certificate by verification code
    const { data: cert, error: certError } = await supabase
      .from('certificates')
      .select('*')
      .or(`verify_code.eq.${verificationCode},verifier_code.eq.${verificationCode},verification_code.eq.${verificationCode}`)
      .maybeSingle()
    
    if (certError || !cert) {
      console.error('❌ Certificate not found:', certError)
      return
    }
    
    console.log('✅ Found certificate:', cert.id)
    
    const enrollmentId = (cert as any).enrollment_id
    const userId = (cert as any).user_id || (cert as any).learner_id
    const courseId = (cert as any).course_id
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, locale')
      .eq('id', userId)
      .maybeSingle()
    
    // Get course info
    const { data: course } = await supabase
      .from('courses')
      .select('title')
      .eq('id', courseId)
      .maybeSingle()
    
    const fullName = profile?.full_name || profile?.email || 'Operator'
    const courseTitle = course?.title || 'Online Forklift Operator Certification'
    
    console.log('👤 Generating certificate for:', fullName)
    console.log('📚 Course:', courseTitle)
    
    const issuedAt = (cert as any).issued_at || (cert as any).created_at || new Date().toISOString()
    const expiresAt = new Date(new Date(issuedAt).getTime() + 1000 * 60 * 60 * 24 * 365 * 3).toISOString()
    
    // Build PDF Certificate
    const pdf = await PDFDocument.create()
    const page = pdf.addPage([792, 612]) // Landscape Letter
    const font = await pdf.embedFont(StandardFonts.Helvetica)
    const fontB = await pdf.embedFont(StandardFonts.HelveticaBold)
    const fontI = await pdf.embedFont(StandardFonts.HelveticaOblique)

    // Brand colors
    const brandOrange = rgb(0.97, 0.4, 0.07) // #F76511
    const darkBlue = rgb(0.06, 0.09, 0.16)
    const mediumGray = rgb(0.38, 0.38, 0.42)
    const lightGray = rgb(0.95, 0.95, 0.95)

    // Background
    page.drawRectangle({ x: 0, y: 0, width: 792, height: 612, color: rgb(1, 1, 1) })
    
    // Decorative outer border
    page.drawRectangle({ x: 30, y: 30, width: 732, height: 552, borderWidth: 3, borderColor: darkBlue })
    page.drawRectangle({ x: 36, y: 36, width: 720, height: 540, borderWidth: 1, borderColor: brandOrange })
    
    // Top banner
    page.drawRectangle({ x: 36, y: 516, width: 720, height: 60, color: lightGray })
    page.drawRectangle({ x: 36, y: 516, width: 720, height: 4, color: brandOrange })

    // Header
    const headerText = 'FLAT EARTH SAFETY TRAINING'
    const headerWidth = fontB.widthOfTextAtSize(headerText, 16)
    page.drawText(headerText, { 
      x: (792 - headerWidth) / 2, 
      y: 547, 
      size: 16, 
      font: fontB, 
      color: darkBlue 
    })
    
    const certificateText = 'CERTIFICATE OF COMPLETION'
    const certificateWidth = fontB.widthOfTextAtSize(certificateText, 22)
    page.drawText(certificateText, { 
      x: (792 - certificateWidth) / 2, 
      y: 526, 
      size: 22, 
      font: fontB, 
      color: brandOrange 
    })

    // OSHA Compliance Badge
    page.drawText('OSHA', { x: 80, y: 470, size: 10, font: fontB, color: mediumGray })
    page.drawText('Compliant', { x: 70, y: 456, size: 8, font, color: mediumGray })
    
    // Main body
    page.drawText('This certifies that', { 
      x: 320, y: 455, size: 16, font: fontI, color: mediumGray 
    })

    // Recipient name
    const nameWidth = fontB.widthOfTextAtSize(fullName, 32)
    page.drawText(fullName, { 
      x: (792 - nameWidth) / 2, y: 410, size: 32, font: fontB, color: darkBlue 
    })
    
    // Decorative line under name
    const lineY = 402
    page.drawLine({
      start: { x: 180, y: lineY },
      end: { x: 612, y: lineY },
      thickness: 2,
      color: brandOrange
    })

    page.drawText('has successfully completed the OSHA-compliant training program:', { 
      x: 175, y: 370, size: 13, font, color: darkBlue 
    })

    // Course title
    const courseTitleWidth = fontB.widthOfTextAtSize(courseTitle, 18)
    page.drawText(courseTitle, { 
      x: (792 - courseTitleWidth) / 2, y: 340, size: 18, font: fontB, color: brandOrange 
    })

    // Training details
    page.drawText('In accordance with 29 CFR 1910.178(l) - Powered Industrial Trucks', { 
      x: 200, y: 310, size: 10, font, color: mediumGray 
    })

    // Dates section
    const issuedDate = new Date(issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const expiresDate = new Date(expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    
    page.drawText(`Issue Date:`, { 
      x: 120, y: 265, size: 10, font: fontB, color: mediumGray 
    })
    page.drawText(issuedDate, { 
      x: 120, y: 250, size: 12, font, color: darkBlue 
    })
    
    page.drawText(`Expiration Date:`, { 
      x: 480, y: 265, size: 10, font: fontB, color: mediumGray 
    })
    page.drawText(expiresDate, { 
      x: 480, y: 250, size: 12, font, color: darkBlue 
    })

    // QR Code Section
    page.drawRectangle({ x: 620, y: 360, width: 140, height: 180, borderWidth: 2, borderColor: mediumGray, color: rgb(1, 1, 1) })
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.flatearthequipment.com'
    const verifyUrl = `${baseUrl}/verify/${verificationCode}`
    const qrBuffer = await generateQRCode(verifyUrl)
    const png = await pdf.embedPng(qrBuffer)
    page.drawImage(png, { x: 635, y: 420, width: 110, height: 110 })
    
    page.drawText(`Code: ${verificationCode}`, { 
      x: 635, y: 405, size: 8, font: fontB, color: darkBlue 
    })
    page.drawText('Scan to verify', { 
      x: 650, y: 375, size: 8, font, color: mediumGray 
    })

    // Footer - OSHA Compliance Notice
    const footerY = 100
    page.drawText('OSHA COMPLIANCE NOTICE', { 
      x: 60, y: footerY + 40, size: 9, font: fontB, color: darkBlue 
    })
    
    const complianceText = [
      'This certificate confirms successful completion of the formal training requirement per 29 CFR 1910.178(l)(1).',
      'OSHA requires additional hands-on workplace evaluation by a qualified person before independent operation.',
      'Employer must document practical evaluation and equipment-specific training per 1910.178(l)(2).',
      'Certificate must be renewed every three years or when reassigned to different equipment.'
    ]
    
    complianceText.forEach((line, i) => {
      page.drawText(line, { 
        x: 60, y: footerY + 25 - (i * 10), size: 7, font, color: mediumGray 
      })
    })

    // Signature section
    page.drawLine({
      start: { x: 120, y: 195 },
      end: { x: 300, y: 195 },
      thickness: 1.5,
      color: darkBlue
    })
    page.drawText('Authorized Signature', { 
      x: 160, y: 180, size: 10, font: fontB, color: darkBlue 
    })
    
    const signature = (cert as any).signature || 'digital-signature'
    page.drawText(`Digital Signature: ${signature.slice(0, 20)}...`, { 
      x: 60, y: 60, size: 7, font, color: mediumGray 
    })
    
    page.drawText('Flat Earth Equipment | flatearthequipment.com', { 
      x: 290, y: 45, size: 8, font, color: mediumGray 
    })

    const pdfBytes = await pdf.save()
    
    console.log('📤 Uploading PDF to storage...')
    
    // Upload to storage
    const path = `${enrollmentId}.pdf`
    const { error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(path, pdfBytes, { upsert: true, contentType: 'application/pdf' })
    
    if (uploadError) {
      console.error('❌ Failed to upload PDF:', uploadError)
      return
    }
    
    const { data: publicUrl } = supabase.storage.from('certificates').getPublicUrl(path)
    const pdfUrl = publicUrl?.publicUrl || ''
    
    // Update certificate record with new PDF URL
    const { error: updateError } = await supabase
      .from('certificates')
      .update({ pdf_url: pdfUrl })
      .eq('id', cert.id)
    
    if (updateError) {
      console.error('❌ Failed to update certificate record:', updateError)
      return
    }
    
    console.log('✅ Certificate PDF regenerated successfully!')
    
    console.log('\n' + '='.repeat(60))
    console.log('🎉 SUCCESS! Certificate PDF Updated')
    console.log('='.repeat(60))
    console.log(`👤 Name: ${fullName}`)
    console.log(`🔐 Verification Code: ${verificationCode}`)
    console.log(`🔗 Verify URL: ${verifyUrl}`)
    console.log(`📄 PDF URL: ${pdfUrl}`)
    console.log('='.repeat(60))
    
  } catch (error) {
    console.error('❌ Script error:', error)
    process.exit(1)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)

if (args.length < 1) {
  console.error('Usage: npx tsx scripts/regenerate-certificate-pdf.ts <verification-code>')
  console.error('Example: npx tsx scripts/regenerate-certificate-pdf.ts LGSRX5GVYE')
  process.exit(1)
}

const verificationCode = args[0]

regenerateCertificatePDF(verificationCode)
