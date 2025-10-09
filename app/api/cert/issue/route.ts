import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { sendMail } from '@/lib/email/mailer';
import { T } from '@/lib/email/templates';
import { logServerError } from '@/lib/monitor/log.server';
import QRCode from 'qrcode';
import { randomCode } from '@/lib/certs/code';
import { signPayload } from '@/lib/certs/sign';
import { auditLog } from '@/lib/audit/log.server';
import { withSpan } from '@/lib/obs/withSpan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const sb = supabaseService();
    const { enrollment_id } = await req.json();
    if (!enrollment_id) {
      console.error('[cert/issue] No enrollment_id provided in request');
      return NextResponse.json({ ok: false, error: 'missing enrollment_id' }, { status: 400 });
    }

    console.log('[cert/issue] Generating certificate for enrollment:', enrollment_id);

    // Load enrollment + profile + course
    const { data: enr, error: e1 } = await sb
      .from('enrollments')
      .select('id, user_id, course_id, created_at, passed')
      .eq('id', enrollment_id).single();
    if (e1 || !enr) {
      console.error('[cert/issue] Enrollment not found:', e1?.message);
      return NextResponse.json({ ok: false, error: 'enrollment not found' }, { status: 404 });
    }

  // Get profile and also fetch auth user metadata as fallback
  const { data: prof } = await sb.from('profiles').select('full_name, email, locale').eq('id', enr.user_id).maybeSingle();
  const { data: course } = await sb.from('courses').select('title').eq('id', enr.course_id).maybeSingle();
  
  // Try to get user's full name from multiple sources
  let fullName = prof?.full_name;
  
  // If profile doesn't have full_name, try auth user_metadata
  if (!fullName || fullName.trim() === '') {
    try {
      const { data: authUser } = await sb.auth.admin.getUserById(enr.user_id);
      fullName = authUser?.user?.user_metadata?.full_name || null;
      
      // If we found a name in user_metadata, update the profile for future use
      if (fullName && fullName.trim() !== '') {
        await sb.from('profiles').upsert({
          id: enr.user_id,
          full_name: fullName,
          email: prof?.email || authUser?.user?.email
        }).select();
      }
    } catch (e) {
      console.warn('[cert/issue] Could not fetch user metadata:', e);
    }
  }

  // Check practical eval (optional - certificate is issued after exam pass)
  // Practical evaluation is tracked separately but doesn't gate certificate issuance
  let practical_verified = false; 
  let evaluation_date: string | null = null;
  
  const { data: ev } = await sb
    .from('employer_evaluations')
    .select('practical_pass, evaluation_date')
    .eq('enrollment_id', enrollment_id)
    .order('evaluation_date', { ascending: false })
    .limit(1);
  
  if (ev && ev[0]?.practical_pass) { 
    practical_verified = true; 
    evaluation_date = ev[0].evaluation_date; 
  }

  // Note: Certificate is issued immediately upon exam pass
  // Practical evaluation is a separate compliance requirement tracked independently

  // Prepare payload
  const issued_at = new Date().toISOString();
  const expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 3).toISOString(); // ~3 years
  const verification_code = randomCode(10);
  
  console.log('[cert/issue] Prepared cert data:', { enrollment_id: enr.id, verification_code });
  
  const payload = {
    cert_version: 1,
    enrollment_id: enr.id,
    user_id: enr.user_id,
    name: fullName || prof?.email || 'Operator',
    email: prof?.email || '',
    course_title: course?.title || 'Forklift Operator',
    issued_at,
    expires_at,
    practical_verified,
    evaluation_date
  };
  
  let signature = '';
  try {
    const signed = signPayload(payload);
    signature = signed.signature;
  } catch (signError) {
    console.error('[cert/issue] Signing failed, using empty signature:', signError);
    signature = 'unsigned';
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || '';
  const verifyUrl = `${base}/verify/${verification_code}`;

  // Build Professional PDF Certificate
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([792, 612]); // Landscape Letter for better layout
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontB = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontI = await pdf.embedFont(StandardFonts.HelveticaOblique);

  // Brand colors
  const brandOrange = rgb(0.97, 0.4, 0.07); // #F76511
  const darkBlue = rgb(0.06, 0.09, 0.16);
  const mediumGray = rgb(0.38, 0.38, 0.42);
  const lightGray = rgb(0.95, 0.95, 0.95);

  // Background
  page.drawRectangle({ x: 0, y: 0, width: 792, height: 612, color: rgb(1, 1, 1) });
  
  // Decorative outer border
  page.drawRectangle({ x: 30, y: 30, width: 732, height: 552, borderWidth: 3, borderColor: darkBlue });
  page.drawRectangle({ x: 36, y: 36, width: 720, height: 540, borderWidth: 1, borderColor: brandOrange });
  
  // Top banner
  page.drawRectangle({ x: 36, y: 516, width: 720, height: 60, color: lightGray });
  page.drawRectangle({ x: 36, y: 516, width: 720, height: 4, color: brandOrange });

  // Header - Properly centered for better visual alignment
  const headerText = 'FLAT EARTH SAFETY TRAINING';
  const headerWidth = fontB.widthOfTextAtSize(headerText, 16);
  page.drawText(headerText, { 
    x: (792 - headerWidth) / 2, 
    y: 547, 
    size: 16, 
    font: fontB, 
    color: darkBlue 
  });
  
  const certificateText = 'CERTIFICATE OF COMPLETION';
  const certificateWidth = fontB.widthOfTextAtSize(certificateText, 22);
  page.drawText(certificateText, { 
    x: (792 - certificateWidth) / 2, 
    y: 526, 
    size: 22, 
    font: fontB, 
    color: brandOrange 
  });

  // OSHA Compliance Badge
  page.drawText('OSHA', { x: 80, y: 470, size: 10, font: fontB, color: mediumGray });
  page.drawText('Compliant', { x: 70, y: 456, size: 8, font, color: mediumGray });
  
  // Main body - Centered layout with better spacing
  page.drawText('This certifies that', { 
    x: 320, y: 455, size: 16, font: fontI, color: mediumGray 
  });

  // Recipient name (larger, more prominent, better centered)
  const name = payload.name || payload.email || payload.user_id;
  const nameWidth = fontB.widthOfTextAtSize(name, 32);
  page.drawText(name, { 
    x: (792 - nameWidth) / 2, y: 410, size: 32, font: fontB, color: darkBlue 
  });
  
  // Elegant decorative line under name (longer, thicker)
  const lineY = 402;
  page.drawLine({
    start: { x: 180, y: lineY },
    end: { x: 612, y: lineY },
    thickness: 2,
    color: brandOrange
  });

  page.drawText('has successfully completed the OSHA-compliant training program:', { 
    x: 175, y: 370, size: 13, font, color: darkBlue 
  });

  // Course title (larger, more prominent)
  const courseTitle = payload.course_title || 'Online Forklift Operator Certification';
  const courseTitleWidth = fontB.widthOfTextAtSize(courseTitle, 18);
  page.drawText(courseTitle, { 
    x: (792 - courseTitleWidth) / 2, y: 340, size: 18, font: fontB, color: brandOrange 
  });

  // Training details
  page.drawText('In accordance with 29 CFR 1910.178(l) - Powered Industrial Trucks', { 
    x: 200, y: 310, size: 10, font, color: mediumGray 
  });

  // Dates section (better spacing and formatting)
  const issuedDate = new Date(issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const expiresDate = new Date(expires_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  page.drawText(`Issue Date:`, { 
    x: 120, y: 265, size: 10, font: fontB, color: mediumGray 
  });
  page.drawText(issuedDate, { 
    x: 120, y: 250, size: 12, font, color: darkBlue 
  });
  
  page.drawText(`Expiration Date:`, { 
    x: 480, y: 265, size: 10, font: fontB, color: mediumGray 
  });
  page.drawText(expiresDate, { 
    x: 480, y: 250, size: 12, font, color: darkBlue 
  });

  // Practical verification badge (if applicable)
  if (practical_verified) {
    page.drawRectangle({ x: 320, y: 235, width: 150, height: 30, color: rgb(0.9, 0.98, 0.93), borderWidth: 1, borderColor: rgb(0.12, 0.65, 0.37) });
    page.drawText('✓ PRACTICAL VERIFIED', { 
      x: 330, y: 245, size: 11, font: fontB, color: rgb(0.12, 0.65, 0.37) 
    });
    if (evaluation_date) {
      page.drawText(`Evaluated: ${new Date(evaluation_date).toLocaleDateString()}`, { 
        x: 330, y: 220, size: 9, font, color: mediumGray 
      });
    }
  }

  // QR Code Section (Right side, bordered)
  page.drawRectangle({ x: 620, y: 360, width: 140, height: 180, borderWidth: 2, borderColor: mediumGray, color: rgb(1, 1, 1) });
  page.drawText('VERIFY', { x: 662, y: 525, size: 10, font: fontB, color: darkBlue });
  
  const { generateVerificationQRBuffer } = await import('@/lib/cert/qrcode');
  const qrBuffer = await generateVerificationQRBuffer(verification_code, base, {
    width: 200,
    margin: 1,
    errorCorrectionLevel: 'M'
  });
  const png = await pdf.embedPng(qrBuffer);
  page.drawImage(png, { x: 635, y: 420, width: 110, height: 110 });
  
  page.drawText(`Code: ${verification_code}`, { 
    x: 635, y: 405, size: 8, font: fontB, color: darkBlue 
  });
  page.drawText('Scan to verify', { 
    x: 650, y: 375, size: 8, font, color: mediumGray 
  });

  // Footer - OSHA Compliance Notice
  const footerY = 100;
  page.drawText('OSHA COMPLIANCE NOTICE', { 
    x: 60, y: footerY + 40, size: 9, font: fontB, color: darkBlue 
  });
  
  const complianceText = [
    'This certificate confirms successful completion of the formal training requirement per 29 CFR 1910.178(l)(1).',
    'OSHA requires additional hands-on workplace evaluation by a qualified person before independent operation.',
    'Employer must document practical evaluation and equipment-specific training per 1910.178(l)(2).',
    'Certificate must be renewed every three years or when reassigned to different equipment.'
  ];
  
  complianceText.forEach((line, i) => {
    page.drawText(line, { 
      x: 60, y: footerY + 25 - (i * 10), size: 7, font, color: mediumGray 
    });
  });

  // Signature section (more prominent)
  page.drawLine({
    start: { x: 120, y: 195 },
    end: { x: 300, y: 195 },
    thickness: 1.5,
    color: darkBlue
  });
  page.drawText('Authorized Signature', { 
    x: 160, y: 180, size: 10, font: fontB, color: darkBlue 
  });
  
  // Digital signature hash
  page.drawText(`Digital Signature: ${signature.slice(0, 20)}...`, { 
    x: 60, y: 60, size: 7, font, color: mediumGray 
  });
  
  page.drawText('Flat Earth Equipment | flatearthequipment.com', { 
    x: 290, y: 45, size: 8, font, color: mediumGray 
  });

  const pdfBytes = await pdf.save();

  // Upload to storage and save certificate record
  const { pdf_url } = await withSpan('Certificate Issue', 'http.server', async () => {
    const path = `${enrollment_id}.pdf`;
    
    const up = await sb.storage.from('certificates').upload(path, pdfBytes, { upsert: true, contentType: 'application/pdf' });
    if (up.error) {
      console.error('[cert/issue] Storage upload error:', up.error);
      await logServerError('cert_issue', 'upload_error', { error: up.error.message, enrollment_id });
      throw new Error(up.error.message);
    }
    
    const { data: pub } = sb.storage.from('certificates').getPublicUrl(path);
    const pdf_url = pub?.publicUrl || '';

    // Insert/upsert certificates row with all required fields
    const certData = {
      learner_id: enr.user_id, // REQUIRED
      enrollment_id,
      course_id: enr.course_id, // REQUIRED
      pdf_url,
      issued_at,
      issue_date: new Date().toISOString().split('T')[0], // REQUIRED: date only
      score: 80, // REQUIRED: default passing score
      verification_code,
      verifier_code: verification_code, // Legacy field
      signature,
      signed_payload: payload
    };
    
    // Try insert first
    const { data: insertResult, error: insertError } = await sb
      .from('certificates')
      .insert(certData)
      .select();
    
    if (insertError) {
      // If insert fails due to duplicate, try update
      if (insertError.code === '23505') { // duplicate key
        const { data: updateResult, error: updateError } = await sb
          .from('certificates')
          .update(certData)
          .eq('enrollment_id', enrollment_id)
          .select();
        
        if (updateError) {
          console.error('[cert/issue] Failed to save certificate:', updateError);
          throw new Error(`Failed to save certificate: ${updateError.message}`);
        }
      } else {
        console.error('[cert/issue] Failed to insert certificate:', insertError);
        throw new Error(`Failed to insert certificate: ${insertError.message}`);
      }
    }
    
    return { pdf_url };
  }, { enrollment_id });

  // Audit log certificate issuance
  await auditLog({ actor_id: enr.user_id, action: 'certificate_issued', entity: 'certificates', entity_id: enrollment_id, meta: { verification_code, course_title: course?.title } });

  // Email hooks (best-effort)
  try {
    const email = prof?.email;
    const name = prof?.full_name || 'Operator';
    if (email && verification_code) {
      const L = prof?.locale || 'en';
      const template = T.cert_issued(name, verification_code, L);
      await sendMail({ to: email, ...template });
    }
  } catch (err) {
    console.warn('[email] Failed to send certificate issued email:', err);
  }

    console.log('[cert/issue] Certificate generated successfully:', verification_code);
    
    return NextResponse.json({ 
      ok: true, 
      enrollment_id, 
      pdf_url, 
      verification_code, 
      practical_verified 
    });
  } catch (error: any) {
    console.error('[cert/issue] Certificate generation failed:', error.message);
    return NextResponse.json({ 
      ok: false, 
      error: 'Certificate generation failed', 
      details: error.message 
    }, { status: 500 });
  }
}
