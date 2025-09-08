import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

export async function GET(_: Request, ctx: { params: { code: string } }) {
  const code = ctx.params.code;
  if (!code || code.length < 6) {
    return NextResponse.json({ ok: false, status: 'not_found' }, { status: 404 });
  }
  const svc = supabaseService();
  const { data: cert, error } = await svc
    .from('certificates')
    .select('id, user_id, course_slug, issued_at, pdf_url, verify_code, revoked_at, revoked_reason, trainer_signature_url, trainee_signature_url')
    .eq('verify_code', code)
    .maybeSingle();
  if (error || !cert) {
    return NextResponse.json({ ok: false, status: 'not_found' }, { status: 404 });
  }

  let full_name: string | null = null;
  // Try to read from profiles if available
  const { data: prof } = await svc
    .from('profiles')
    .select('full_name')
    .eq('id', cert.user_id)
    .maybeSingle();
  full_name = prof?.full_name ?? null;

  const status = cert.revoked_at ? 'revoked' : 'valid';
  return NextResponse.json({
    ok: true,
    status,
    certificate: {
      id: cert.id,
      verify_code: cert.verify_code,
      issued_at: cert.issued_at,
      pdf_url: cert.pdf_url,
      course_slug: cert.course_slug,
      user_id: cert.user_id,
      full_name,
      trainer_signature_url: cert.trainer_signature_url,
      trainee_signature_url: cert.trainee_signature_url,
      revoked_at: cert.revoked_at,
      revoked_reason: cert.revoked_reason
    }
  });
}