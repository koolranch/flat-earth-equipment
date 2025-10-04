import { NextRequest, NextResponse } from 'next/server';
import { generateWalletCardPDF } from '@/lib/pdf/generateWalletCard';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const certificateId = params.id;
    console.log('[wallet] Generating wallet card for certificate:', certificateId);
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const orgName = process.env.NEXT_PUBLIC_BRAND_NAME || 'Flat Earth Equipment';
    const brand = process.env.NEXT_PUBLIC_BRAND_PRIMARY || '#F76511';

    const s = supabaseService();

    // Load certificate + profile + employer
    const { data: cert, error: certErr } = await s
      .from('certificates')
      .select('id, verification_code, verifier_code, issued_at, wallet_pdf_url, enrollment_id')
      .eq('id', certificateId)
      .single();
    
    console.log('[wallet] Certificate lookup:', { found: !!cert, error: certErr?.message });
    
    if (certErr || !cert) {
      console.error('[wallet] Certificate not found for ID:', certificateId, 'Error:', certErr);
      return NextResponse.json({ error: 'Certificate not found', details: certErr?.message }, { status: 404 });
    }

  // Get learner profile and employer via enrollment
  const { data: enrollment, error: enrErr } = await s
    .from('enrollments')
    .select('id, user_id, employer_name')
    .eq('id', cert.enrollment_id)
    .single();
  
  console.log('[wallet] Enrollment lookup:', { found: !!enrollment, error: enrErr?.message });
  if (enrErr || !enrollment) {
    console.error('[wallet] Enrollment not found for cert enrollment_id:', cert.enrollment_id, 'Error:', enrErr);
    return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
  }

  const { data: profile, error: profErr } = await s
    .from('profiles')
    .select('full_name')
    .eq('id', enrollment.user_id)
    .maybeSingle();
  
  console.log('[wallet] Profile lookup:', { found: !!profile, name: profile?.full_name, error: profErr?.message });
  
  // Don't fail if profile is missing - use fallback name
  const traineeName = profile?.full_name || enrollment.user_id;

  // Calculate expiration (3 years from issue)
  const expiresAt = cert.issued_at 
    ? new Date(new Date(cert.issued_at).getTime() + (3 * 365 * 24 * 60 * 60 * 1000)).toISOString()
    : null;

  const payload = {
    traineeName: traineeName,
    employer: enrollment?.employer_name || null,
    certificateId: cert.id,
    verifyCode: cert.verification_code || cert.verifier_code || 'N/A',
    issuedAt: cert.issued_at,
    expiresAt: expiresAt,
    equipment: 'Powered Industrial Truck',
    baseUrl,
    orgName,
    brandHex: brand,
  };
  
  console.log('[wallet] Generating PDF with payload:', { 
    traineeName, 
    verifyCode: payload.verifyCode,
    issuedAt: !!payload.issuedAt 
  });

  const pdfBytes = await generateWalletCardPDF(payload);

  const path = `wallet-cards/${cert.id}-wallet.pdf`;
  const { data: up, error: upErr } = await s.storage.from('certificates').upload(path, pdfBytes, {
    contentType: 'application/pdf',
    upsert: true,
  });
  if (upErr) return NextResponse.json({ error: 'Upload failed', detail: upErr.message }, { status: 500 });

  const { data: pub } = s.storage.from('certificates').getPublicUrl(path);

  const { error: updErr } = await s
    .from('certificates')
    .update({ wallet_pdf_url: pub?.publicUrl, updated_at: new Date().toISOString() })
    .eq('id', cert.id);
  if (updErr) return NextResponse.json({ error: 'DB update failed', detail: updErr.message }, { status: 500 });

    console.log('[wallet] Wallet card generated successfully:', pub?.publicUrl);
    return NextResponse.json({ ok: true, url: pub?.publicUrl });
  } catch (error: any) {
    console.error('[wallet] Error generating wallet card:', error);
    return NextResponse.json({ error: 'Generation failed', details: error.message }, { status: 500 });
  }
}
