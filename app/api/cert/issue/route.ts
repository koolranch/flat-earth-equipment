import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { sendMail } from '@/lib/email/mailer';
import { T } from '@/lib/email/templates';
import { logServerError } from '@/lib/monitor/log.server';
import QRCode from 'qrcode';
import { randomCode } from '@/lib/certs/code';
import { signPayload } from '@/lib/certs/sign';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const sb = supabaseService();
  const { enrollment_id } = await req.json();
  if (!enrollment_id) return NextResponse.json({ ok: false, error: 'missing enrollment_id' }, { status: 400 });

  // Load enrollment + profile + course
  const { data: enr, error: e1 } = await sb
    .from('enrollments')
    .select('id, user_id, course_id, created_at, passed')
    .eq('id', enrollment_id).single();
  if (e1 || !enr) return NextResponse.json({ ok: false, error: 'enrollment not found' }, { status: 404 });

  const { data: prof } = await sb.from('profiles').select('full_name, email').eq('id', enr.user_id).maybeSingle();
  const { data: course } = await sb.from('courses').select('title').eq('id', enr.course_id).maybeSingle();

  // Check practical eval (required unless override is set)
  const allowExamOnly = process.env.ALLOW_EXAM_ONLY_CERT === '1';
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

  // Gate certificate issuance on practical evaluation
  if (!allowExamOnly && !practical_verified) {
    return NextResponse.json({ ok: false, error: 'practical_evaluation_required' }, { status: 400 });
  }

  // Prepare payload
  const issued_at = new Date().toISOString();
  const expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 3).toISOString(); // ~3 years
  const verification_code = randomCode(10);
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
  const { json: signed_payload, signature } = signPayload(payload);

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

  // Upload to storage
  const path = `${enrollment_id}.pdf`;
  const up = await sb.storage.from('certificates').upload(path, pdfBytes, { upsert: true, contentType: 'application/pdf' });
  if (up.error) {
    await logServerError('cert_issue', 'upload_error', { error: up.error.message, enrollment_id });
    return NextResponse.json({ ok: false, error: up.error.message }, { status: 500 });
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

  // Optional: audit
  try { 
    await sb.from('audit_log').insert({ 
      actor_id: enr.user_id, 
      action: 'certificate_issued', 
      notes: { enrollment_id, verification_code } 
    }); 
  } catch {
    // Audit logging is optional
  }

  // Email hooks (best-effort)
  try {
    const email = prof?.email;
    const name = prof?.full_name || 'Operator';
    if (email && verification_code) {
      const template = T.cert_issued(name, verification_code);
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
}
