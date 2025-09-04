import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { renderEvaluationPdf } from '@/lib/eval/pdf';
import { sendMail } from '@/lib/email/mailer';
import { T } from '@/lib/email/templates';

export const dynamic = 'force-dynamic';

async function isTrainerOrAdmin(id:string){
  const svc = supabaseService();
  const { data } = await svc.from('profiles').select('role').eq('id', id).maybeSingle();
  return data && ['trainer','admin'].includes((data as any).role);
}

export async function POST(req: Request){
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok:false, error:'unauthorized' }, { status:401 });
  if (!(await isTrainerOrAdmin(user.id))) return NextResponse.json({ ok:false, error:'forbidden' }, { status:403 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ ok:false, error:'missing_id' }, { status:400 });

  const { data: ev } = await svc.from('employer_evaluations').select('*').eq('id', id).maybeSingle();
  if (!ev) return NextResponse.json({ ok:false, error:'not_found' }, { status:404 });

  // fetch signature bytes if present
  let sigBytes: Uint8Array | null = null;
  if (ev.signature_url){
    try { const r = await fetch(ev.signature_url); const ab = await r.arrayBuffer(); sigBytes = new Uint8Array(ab); } catch {}
  }

  // lookup certificate verification code (if exists)
  let verification_code: string | null = null;
  if (ev.trainee_user_id && ev.course_id){
    const { data: cert } = await svc.from('certificates').select('verification_code').eq('user_id', ev.trainee_user_id).eq('course_id', ev.course_id).order('issued_at', { ascending:false }).limit(1).maybeSingle();
    verification_code = cert?.verification_code || null;
  }

  const pdfBytes = await renderEvaluationPdf({
    trainee_name: ev.trainee_name || ev.trainee_email || 'Trainee',
    trainee_email: ev.trainee_email,
    course_title: ev.course_title || 'Forklift Operator',
    evaluator_name: ev.evaluator_name,
    evaluator_title: ev.evaluator_title,
    site_location: ev.site_location,
    evaluation_date: ev.evaluation_date,
    truck_type: ev.truck_type,
    checklist: ev.checklist || {},
    overall_pass: !!ev.overall_pass,
    notes: ev.notes,
    signature_png_bytes: sigBytes,
    verification_code
  });

  const path = `eval-${id}.pdf`;
  const up = await svc.storage.from('evaluations').upload(path, pdfBytes, { contentType: 'application/pdf', upsert: true });
  if (up.error) return NextResponse.json({ ok:false, error: up.error.message }, { status:500 });
  const { data: pub } = svc.storage.from('evaluations').getPublicUrl(path);

  await svc.from('employer_evaluations').update({ pdf_url: pub.publicUrl, finalized: true }).eq('id', id);

  // optional marker on certificates
  if (ev.trainee_user_id && ev.course_id){
    await svc.from('certificates').update({ practical_eval_on_file: true }).eq('user_id', ev.trainee_user_id).eq('course_id', ev.course_id);
  }

  // Email hooks (best-effort)
  try {
    if (ev.trainee_email) {
      const template = T.eval_finalized(ev.trainee_email, pub.publicUrl);
      await sendMail({ to: ev.trainee_email, ...template });
    }
  } catch (err) {
    console.warn('[email] Failed to send evaluation finalized email:', err);
  }

  return NextResponse.json({ ok:true, pdf_url: pub.publicUrl });
}
