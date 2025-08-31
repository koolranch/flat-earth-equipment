import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { verifyPayload } from '@/lib/certs/sign';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  if (!code) return NextResponse.json({ ok: false, error: 'missing code' }, { status: 400 });

  const sb = supabaseService();
  const { data: cert } = await sb
    .from('certificates')
    .select('enrollment_id, pdf_url, issued_at, verification_code, signature, signed_payload')
    .eq('verification_code', code)
    .maybeSingle();
    
  if (!cert) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });

  // Validate signature
  const payload = cert.signed_payload as any;
  const json = JSON.stringify(payload);
  const valid = verifyPayload(json, cert.signature);

  // Check expiration
  const now = Date.now();
  const expired = payload?.expires_at ? (now > Date.parse(payload.expires_at)) : false;

  // Practical flag may have changed; recompute current status (non-binding, display only)
  let practical_verified = !!payload?.practical_verified;
  try {
    const { data: ev } = await sb
      .from('employer_evaluations')
      .select('practical_pass')
      .eq('enrollment_id', cert.enrollment_id)
      .order('evaluation_date', { ascending: false })
      .limit(1);
    if (ev && ev[0]?.practical_pass) practical_verified = true;
  } catch {
    // Practical evaluation check is optional
  }

  return NextResponse.json({
    ok: true,
    valid,
    expired,
    details: {
      enrollment_id: cert.enrollment_id,
      pdf_url: cert.pdf_url,
      issued_at: cert.issued_at,
      name: payload?.name,
      email: payload?.email,
      course_title: payload?.course_title,
      expires_at: payload?.expires_at,
      practical_verified
    }
  });
}
