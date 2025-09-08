import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { renderCertificatePDF } from '@/lib/pdf/certificateTemplate';

export async function POST(req: Request){
  try{
    const { certificate_id } = await req.json();
    const svc = supabaseService();
    const { data: cert, error } = await svc
      .from('certificates')
      .select('id, user_id, verify_code, trainer_signature_url, trainee_signature_url, issued_at, course_slug, pdf_url, users(full_name)')
      .eq('id', certificate_id)
      .single();
    if(error) throw error;

    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/verify/${cert.verify_code}`;
    const pdfNode = await renderCertificatePDF({
      fullName: cert.users?.full_name || 'Learner',
      issuedAt: cert.issued_at || new Date().toISOString(),
      verifyUrl,
      trainerSignatureUrl: cert.trainer_signature_url,
      traineeSignatureUrl: cert.trainee_signature_url
    });

    // TODO: your existing PDF renderer (e.g., renderToStream) & upload to storage.
    // Keep your existing implementation; the important part is the new props.

    return NextResponse.json({ ok: true });
  }catch(e){
    console.error('cert/pdf', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
