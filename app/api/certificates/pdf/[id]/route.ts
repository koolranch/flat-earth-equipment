// app/api/certificates/pdf/[id]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: cert, error } = await supabase
    .from('certificates')
    .select('id, learner_id, course_id, issue_date, score, verifier_code, pdf_url')
    .eq('id', params.id)
    .maybeSingle();

  if (error || !cert) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Build a tiny PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter portrait
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const draw = (text: string, y: number, size = 14) => {
    page.drawText(text, { x: 72, y, size, font, color: rgb(0.06, 0.09, 0.165) });
  };

  draw('Flat Earth Safety — Forklift Operator Certificate', 720, 18);
  draw(`Course: ${cert.course_id}`, 670);
  draw(`Issued: ${cert.issue_date}`, 646);
  draw(`Score: ${cert.score}%`, 622);
  draw(`Verify Code: ${cert.verifier_code}`, 598);
  draw('Learner: ** (masked)', 574);
  draw('This certificate confirms successful completion of the formal knowledge assessment and training.', 520);

  const pdfBytes = await pdfDoc.save();

  // Upload to storage
  const filePath = `${cert.id}.pdf`;
  const { data: up, error: upErr } = await supabase.storage.from('certificates').upload(filePath, new Blob([pdfBytes], { type: 'application/pdf' }), { upsert: true });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });

  // Get public URL
  const { data: pub } = supabase.storage.from('certificates').getPublicUrl(filePath);
  const pdf_url = pub.publicUrl;

  await supabase.from('certificates').update({ pdf_url }).eq('id', cert.id);

  return NextResponse.json({ pdf_url });
}
