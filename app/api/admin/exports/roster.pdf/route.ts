// app/api/admin/exports/roster.pdf/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId');
  const token = (req.headers.get('x-admin-token') || '').trim();
  if (!orgId) return NextResponse.json({ error: 'orgId required' }, { status: 400 });
  if (!process.env.ADMIN_EXPORT_TOKEN || token !== process.env.ADMIN_EXPORT_TOKEN)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = supabaseService();
  const { data: enrs, error } = await sb
    .from('enrollments')
    .select('id,user_id,learner_email,course_id,progress_pct,passed')
    .eq('org_id', orgId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const draw = (text: string, y: number, size = 10) => page.drawText(text, { x: 48, y, size, font, color: rgb(0,0,0) });
  let y = 740;
  draw('Flat Earth Safety — Roster Export', y, 14); y -= 24;
  draw('enrollment_id,user_id,learner_email,course_id,progress_pct,passed', y); y -= 16;
  for (const e of (enrs||[])) {
    const line = [e.id, e.user_id, e.learner_email||'', e.course_id, String(e.progress_pct??''), String(!!e.passed)].join(',');
    draw(line, y); y -= 14; if (y < 48) { y = 740; pdf.addPage([612,792]); }
  }
  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=roster.pdf' }});
}
