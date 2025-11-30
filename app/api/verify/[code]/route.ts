import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_: Request, ctx: { params: { code: string } }) {
  const code = ctx.params.code;
  if (!code || code.length < 6) {
    return NextResponse.json({ ok: false, status: 'not_found' }, { status: 404 });
  }
  const svc = supabaseService();
  // Be flexible across historical column names: verifier_code (original), verification_code (newer), verify_code (intermediate)
  const { data: cert, error } = await svc
    .from('certificates')
    // Select all to avoid errors on environments with differing column sets
    .select('*')
    .or(`verify_code.eq.${code},verifier_code.eq.${code},verification_code.eq.${code}`)
    .maybeSingle();
  if (error || !cert) {
    return NextResponse.json({ ok: false, status: 'not_found' }, { status: 404 });
  }

  let full_name: string | null = null;
  // Try to read from profiles if available. Fallback to learner_id if user_id absent
  const userId = (cert as any).user_id || (cert as any).learner_id;
  const { data: prof } = userId ? await svc
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .maybeSingle() : { data: null } as any;
  full_name = prof?.full_name ?? null;

  const status = cert.revoked_at ? 'revoked' : 'valid';
  return NextResponse.json({
    ok: true,
    status,
    certificate: {
      id: cert.id,
      // Normalize outgoing shape expected by the UI
      verify_code: (cert as any).verify_code || (cert as any).verifier_code || (cert as any).verification_code,
      issued_at: (cert as any).issued_at || (cert as any).created_at || null,
      pdf_url: cert.pdf_url,
      course_slug: (cert as any).course_slug || (cert as any).course_id || null,
      user_id: userId || null,
      full_name,
      trainer_signature_url: cert.trainer_signature_url,
      trainee_signature_url: cert.trainee_signature_url,
      revoked_at: cert.revoked_at,
      revoked_reason: cert.revoked_reason
    }
  });
}