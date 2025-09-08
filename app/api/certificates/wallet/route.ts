import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { renderCertificatePDF } from '@/lib/pdf/certificateTemplate';

export async function POST(req: Request) {
  try {
    const ct = req.headers.get('content-type') || '';
    let code: string | null = null;
    if (ct.includes('application/json')) {
      const body = await req.json();
      code = body?.code ?? null;
    } else {
      const form = await req.formData();
      code = (form.get('code') as string) || null;
    }
    if (!code) return NextResponse.json({ error: 'code_required' }, { status: 400 });

    const svc = supabaseService();
    const { data: cert, error } = await svc
      .from('certificates')
      .select('id, user_id, course_slug, issued_at, verify_code, trainer_signature_url, trainee_signature_url')
      .eq('verify_code', code)
      .maybeSingle();
    if (error || !cert) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    const { data: prof } = await svc.from('profiles').select('full_name').eq('id', cert.user_id).maybeSingle();
    const fullName = prof?.full_name || 'Learner';
    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/verify/${cert.verify_code}`;

    // You can add a separate wallet template; for now reuse renderCertificatePDF props or pass a variant flag if you extend it.
    const node = await renderCertificatePDF({
      fullName,
      issuedAt: cert.issued_at || new Date().toISOString(),
      verifyUrl,
      trainerSignatureUrl: cert.trainer_signature_url,
      traineeSignatureUrl: cert.trainee_signature_url
    });

    // TODO: Render node to PDF buffer/stream and upload to storage, then redirect to file URL
    // Placeholder response to prove wiring works
    return NextResponse.json({ ok: true, message: 'Wallet card generation stubbed. Wire to your PDF renderer/upload.' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
