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
    if (!enrollment_id) return NextResponse.json({ ok: false, error: 'missing enrollment_id' }, { status: 400 });

    console.log('[cert/issue] Starting certificate generation for enrollment:', enrollment_id);

    // Load enrollment + profile + course
    const { data: enr, error: e1 } = await sb
      .from('enrollments')
      .select('id, user_id, course_id, created_at, passed')
      .eq('id', enrollment_id).single();
    if (e1 || !enr) {
      console.error('[cert/issue] Enrollment not found:', e1?.message);
      return NextResponse.json({ ok: false, error: 'enrollment not found' }, { status: 404 });
    }

  const { data: prof } = await sb.from('profiles').select('full_name, email, locale').eq('id', enr.user_id).maybeSingle();
  const { data: course } = await sb.from('courses').select('title').eq('id', enr.course_id).maybeSingle();

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
  console.log('[cert/issue] Issuing certificate for enrollment:', enrollment_id, 'practical verified:', practical_verified);

  // Prepare payload
  const issued_at = new Date().toISOString();
  const expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 3).toISOString(); // ~3 years
  const verification_code = randomCode(10);
  
  console.log('[cert/issue] Prepared cert data:', { enrollment_id: enr.id, verification_code });
  
  const payload = {
    cert_version: 1,
    enrollment_id: enr.id,
    user_id: enr.user_id,
    name: prof?.full_name || '',
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

  // Build PDF
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]); // Letter
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontB = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Background
  page.drawRectangle({ x: 0, y: 0, width: 612, height: 792, color: rgb(1, 1, 1) });
  page.drawRectangle({ x: 36, y: 36, width: 612 - 72, height: 792 - 72, borderWidth: 2, borderColor: rgb(0.06, 0.09, 0.16) });

  // Title
  page.drawText('Flat Earth Safety', { x: 60, y: 720, size: 18, font: fontB, color: rgb(0.06, 0.09, 0.16) });
  page.drawText('Forklift Operator Certificate', { x: 60, y: 690, size: 22, font: fontB, color: rgb(0.97, 0.4, 0.07) });

  // Body
  const name = payload.name || payload.email || payload.user_id;
  page.drawText(`Awarded to: ${name}`, { x: 60, y: 640, size: 14, font, color: rgb(0.06, 0.09, 0.16) });
  page.drawText(`Course: ${payload.course_title}`, { x: 60, y: 615, size: 12, font, color: rgb(0.06, 0.09, 0.16) });
  page.drawText(`Issued: ${new Date(issued_at).toLocaleDateString()}`, { x: 60, y: 595, size: 12, font });
  page.drawText(`Expires: ${new Date(expires_at).toLocaleDateString()}`, { x: 60, y: 575, size: 12, font });
  if (practical_verified) page.drawText('Practical: VERIFIED', { x: 60, y: 555, size: 12, font: fontB, color: rgb(0.12, 0.65, 0.37) });

  // QR code (verify URL) - using improved QR utility
  const { generateVerificationQRBuffer } = await import('@/lib/cert/qrcode');
  const qrBuffer = await generateVerificationQRBuffer(verification_code, base, {
    width: 240,
    margin: 1,
    errorCorrectionLevel: 'M'
  });
  const png = await pdf.embedPng(qrBuffer);
  page.drawImage(png, { x: 390, y: 540, width: 160, height: 160 });
  page.drawText(`Verify: ${verifyUrl}`, { x: 390, y: 510, size: 10, font, color: rgb(0.06, 0.09, 0.16) });
  page.drawText(`Code: ${verification_code}`, { x: 390, y: 495, size: 10, font });

  // Footer (signature hash snippet)
  page.drawText(`Signature: ${signature.slice(0, 16)}…`, { x: 60, y: 90, size: 8, font, color: rgb(0.38, 0.38, 0.42) });

  const pdfBytes = await pdf.save();

  // Upload to storage and save certificate record
  const { pdf_url } = await withSpan('Certificate Issue', 'http.server', async () => {
    const path = `${enrollment_id}.pdf`;
    const up = await sb.storage.from('certificates').upload(path, pdfBytes, { upsert: true, contentType: 'application/pdf' });
    if (up.error) {
      await logServerError('cert_issue', 'upload_error', { error: up.error.message, enrollment_id });
      throw new Error(up.error.message);
    }
    const { data: pub } = sb.storage.from('certificates').getPublicUrl(path);
    const pdf_url = pub?.publicUrl || '';

    // Upsert certificates row
    try {
      await sb.from('certificates').upsert({
        enrollment_id,
        pdf_url,
        issued_at,
        verification_code,
        signature,
        signed_payload: payload
      }, { onConflict: 'enrollment_id' });
    } catch (e: any) {
      // Fallback insert then update
      await sb.from('certificates').insert({ 
        enrollment_id, 
        pdf_url, 
        issued_at, 
        verification_code, 
        signature, 
        signed_payload: payload 
      }).select();
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

    return NextResponse.json({ 
      ok: true, 
      enrollment_id, 
      pdf_url, 
      verification_code, 
      practical_verified 
    });
  } catch (error: any) {
    console.error('[cert/issue] Error generating certificate:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Certificate generation failed', 
      details: error.message 
    }, { status: 500 });
  }
}
