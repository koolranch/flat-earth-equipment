// app/api/certificates/pdf/[id]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { renderCertificateTemplate } from '@/lib/cert/certificateTemplate';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  const qLocale = url.searchParams.get('locale');
  const cLocale = cookies().get('locale')?.value;
  const locale = (qLocale === 'es' || cLocale === 'es') ? 'es' : 'en';

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: cert, error } = await supabase
    .from('certificates')
    .select('id, learner_id, user_id, course_id, enrollment_id, issue_date, issued_at, score, verifier_code, pdf_url')
    .eq('id', params.id)
    .maybeSingle();
  if (error || !cert) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const learnerId = cert.user_id || cert.learner_id;
  const [{ data: profile }, { data: course }, { data: enrollment }] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', learnerId).maybeSingle(),
    supabase.from('courses').select('title').eq('id', cert.course_id).maybeSingle(),
    cert.enrollment_id
      ? supabase.from('enrollments').select('expires_at').eq('id', cert.enrollment_id).maybeSingle()
      : Promise.resolve({ data: null } as { data: { expires_at: string | null } | null }),
  ]);
  const student = profile?.full_name || 'Operator';
  const courseTitle = course?.title || 'Online Forklift Operator Certification';
  const completedAt = cert.issued_at || cert.issue_date || new Date().toISOString();
  const expiresAt =
    enrollment?.expires_at ||
    new Date(new Date(completedAt).setFullYear(new Date(completedAt).getFullYear() + 3)).toISOString();

  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'https://www.flatearthequipment.com';

  // Render with the same template /api/cert/issue uses on exam pass, so
  // regenerated certificates are identical to the ones the app issues.
  const pdfBytes = await renderCertificateTemplate({
    name: student,
    courseTitle,
    verificationCode: cert.verifier_code,
    verifyUrl: `${base}/verify/${cert.verifier_code}?src=pdf`,
    issuedAt: completedAt,
    expiresAt,
    locale,
  });

  const filePath = `${cert.id}.pdf`;
  const { error: upErr } = await supabase.storage.from('certificates').upload(filePath, new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }), { upsert: true });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });
  const { data: pub } = supabase.storage.from('certificates').getPublicUrl(filePath);
  const pdf_url = pub.publicUrl;
  await supabase.from('certificates').update({ pdf_url }).eq('id', cert.id);

  // Browsers (e.g. the trainer roster's PDF link) get sent to the PDF itself;
  // programmatic callers keep the original JSON contract.
  const wantsHtml = (req.headers.get('accept') || '').includes('text/html');
  if (wantsHtml) return NextResponse.redirect(pdf_url);
  return NextResponse.json({ pdf_url, locale });
}
