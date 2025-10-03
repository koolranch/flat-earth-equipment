import { NextRequest, NextResponse } from 'next/server';
import { generateWalletCardPDF } from '@/lib/pdf/generateWalletCard';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const certificateId = params.id;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const orgName = process.env.NEXT_PUBLIC_BRAND_NAME || 'Flat Earth Equipment';
  const brand = process.env.NEXT_PUBLIC_BRAND_PRIMARY || '#F76511';

  const s = supabaseService();

  // Load certificate + profile + employer
  const { data: cert, error: certErr } = await s
    .from('certificates')
    .select('id, verification_code, verifier_code, issued_at, expires_at, wallet_pdf_url, enrollment_id')
    .eq('id', certificateId)
    .single();
  if (certErr || !cert) return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });

  // Get learner profile and employer via enrollment
  const { data: enrollment, error: enrErr } = await s
    .from('enrollments')
    .select('id, user_id, employer_name')
    .eq('id', cert.enrollment_id)
    .single();
  if (enrErr || !enrollment) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });

  const { data: profile, error: profErr } = await s
    .from('profiles')
    .select('full_name')
    .eq('id', enrollment.user_id)
    .single();
  if (profErr) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const payload = {
    traineeName: profile?.full_name || 'Operator',
    employer: enrollment?.employer_name || null,
    certificateId: cert.id,
    verifyCode: cert.verification_code || cert.verifier_code || 'N/A',
    issuedAt: cert.issued_at,
    expiresAt: cert.expires_at,
    equipment: 'Powered Industrial Truck',
    baseUrl,
    orgName,
    brandHex: brand,
  };

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

  return NextResponse.json({ ok: true, url: pub?.publicUrl });
}
