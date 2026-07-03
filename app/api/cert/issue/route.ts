import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { renderCertificateTemplate } from '@/lib/cert/certificateTemplate';
import { sendMail } from '@/lib/email/mailer';
import { T } from '@/lib/email/templates';
import { logServerError } from '@/lib/monitor/log.server';
import { randomCode } from '@/lib/certs/code';
import { signPayload } from '@/lib/certs/sign';
import { auditLog } from '@/lib/audit/log.server';
import { withSpan } from '@/lib/obs/withSpan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const sb = supabaseService();
    const { enrollment_id, verification_code: providedCode } = await req.json();
    if (!enrollment_id) {
      console.error('[cert/issue] No enrollment_id provided in request');
      return NextResponse.json({ ok: false, error: 'missing enrollment_id' }, { status: 400 });
    }

    console.log('[cert/issue] Generating certificate for enrollment:', enrollment_id, providedCode ? `(using provided code: ${providedCode})` : '');

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
  const verification_code = providedCode || randomCode(10);
  
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

  // Build the certificate PDF (shared template — same design for web and app learners)
  const locale = prof?.locale === 'es' ? 'es' : 'en';
  const pdfBytes = await renderCertificateTemplate({
    name: payload.name || payload.email || payload.user_id,
    courseTitle: payload.course_title || 'Online Forklift Operator Certification',
    verificationCode: verification_code,
    verifyUrl: `${verifyUrl}?src=pdf`,
    issuedAt: issued_at,
    expiresAt: expires_at,
    locale,
    practicalVerified: practical_verified,
    evaluationDate: evaluation_date,
  });

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
