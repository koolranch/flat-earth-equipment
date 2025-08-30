// app/api/certificates/pdf/[id]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  const qLocale = url.searchParams.get('locale');
  const cLocale = cookies().get('locale')?.value;
  const locale = (qLocale === 'es' || cLocale === 'es') ? 'es' : 'en';

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: cert, error } = await supabase
    .from('certificates')
    .select('id, learner_id, course_id, issue_date, score, verifier_code, pdf_url, practical_pass, evaluation_date, evaluator_name')
    .eq('id', params.id)
    .maybeSingle();
  if (error || !cert) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const L = (k: string) => {
    const en: Record<string,string> = { 
      title: 'Forklift Operator Certificate', 
      course: 'Course', 
      issued: 'Issued', 
      score: 'Score', 
      verify: 'Verify Code', 
      footer: 'This certificate confirms successful completion of the formal knowledge assessment and training.',
      practical: 'PRACTICAL VERIFIED',
      practicalBy: 'Evaluated by'
    };
    const es: Record<string,string> = { 
      title: 'Certificado de Operador de Montacargas', 
      course: 'Curso', 
      issued: 'Emitido', 
      score: 'Puntuación', 
      verify: 'Código de verificación', 
      footer: 'Este certificado confirma la finalización exitosa de la evaluación de conocimientos y la capacitación formal.',
      practical: 'PRÁCTICA VERIFICADA',
      practicalBy: 'Evaluado por'
    };
    return (locale === 'es' ? es : en)[k];
  };

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const draw = (text: string, y: number, size = 14) => page.drawText(text, { x: 72, y, size, font, color: rgb(0.06, 0.09, 0.165) });

  draw(`Flat Earth Safety — ${L('title')}`, 720, 18);
  draw(`${L('course')}: ${cert.course_id}`, 670);
  draw(`${L('issued')}: ${cert.issue_date}`, 646);
  draw(`${L('score')}: ${cert.score}%`, 622);
  draw(`${L('verify')}: ${cert.verifier_code}`, 598);
  draw('Learner: ** (masked)', 574);
  
  // Add practical verification badge if evaluation passed
  if (cert.practical_pass) {
    page.drawText(L('practical'), { x: 72, y: 550, size: 16, font, color: rgb(0.0, 0.6, 0.0) }); // Green color
    if (cert.evaluator_name) {
      draw(`${L('practicalBy')}: ${cert.evaluator_name}`, 526, 12);
    }
    if (cert.evaluation_date) {
      draw(`Date: ${cert.evaluation_date}`, 506, 12);
    }
  }
  
  draw(L('footer'), 460);

  const pdfBytes = await pdfDoc.save();
  const filePath = `${cert.id}.pdf`;
  const { data: up, error: upErr } = await supabase.storage.from('certificates').upload(filePath, new Blob([pdfBytes], { type: 'application/pdf' }), { upsert: true });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });
  const { data: pub } = supabase.storage.from('certificates').getPublicUrl(filePath);
  const pdf_url = pub.publicUrl;
  await supabase.from('certificates').update({ pdf_url }).eq('id', cert.id);
  return NextResponse.json({ pdf_url, locale });
}