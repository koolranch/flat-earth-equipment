import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { supabaseService } from '@/lib/supabase/service.server';
import { getAuthUser } from '@/lib/supabase/mobile-auth';
import { managerSourceBrand } from '@/lib/training/sourceBrand';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * One-click OSHA audit pack: a single PDF containing a cover summary, the
 * full operator roster with certification + practical-evaluation status, and
 * every operator certificate appended, ready to hand to an inspector.
 */

const PAGE = { w: 612, h: 792, margin: 54 } as const;
const ORANGE = rgb(0.97, 0.4, 0.07);
const DARK = rgb(0.06, 0.09, 0.16);
const GRAY = rgb(0.4, 0.4, 0.45);
const LIGHT = rgb(0.88, 0.89, 0.91);

function fmtDate(d: string | null | undefined) {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export async function GET(req: Request) {
  const svc = supabaseService();
  const { user } = await getAuthUser(req);
  if (!user) return NextResponse.json({ ok: false, error: 'auth_required' }, { status: 401 });
  const { data: prof } = await svc.from('profiles').select('role, full_name, email').eq('id', user.id).maybeSingle();
  if (!prof || !['admin', 'trainer'].includes(prof.role)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  // Same scoping as the roster: this trainer's orders -> seat claims -> learners.
  const { data: orders } = await svc.from('orders').select('id, course_id').eq('user_id', user.id);
  const orderIds = (orders || []).map(o => o.id);
  if (!orderIds.length) return NextResponse.json({ ok: false, error: 'no_orders' }, { status: 404 });

  const { data: claims } = await svc.from('seat_claims').select('order_id, user_id').in('order_id', orderIds);
  const learnerIds = Array.from(new Set((claims || []).map(c => c.user_id)));

  const [{ data: learners }, { data: enrollments }, brand] = await Promise.all([
    learnerIds.length ? svc.from('profiles').select('id, full_name, email').in('id', learnerIds) : Promise.resolve({ data: [] as any[] }),
    learnerIds.length ? svc.from('enrollments').select('id, user_id, course_id, course_slug, progress_pct, passed, cert_url, expires_at, created_at').in('user_id', learnerIds) : Promise.resolve({ data: [] as any[] }),
    managerSourceBrand(svc, user.id),
  ]);
  const learnerById: Record<string, any> = Object.fromEntries((learners || []).map(l => [l.id, l]));
  const enrollmentIds = (enrollments || []).map(e => e.id);

  let certs: any[] = [];
  let evals: any[] = [];
  if (enrollmentIds.length) {
    const [certRes, evalRes] = await Promise.all([
      svc.from('certificates').select('enrollment_id, pdf_url, issued_at, verifier_code, revoked_at').in('enrollment_id', enrollmentIds).order('issued_at', { ascending: false }),
      svc.from('employer_evaluations').select('enrollment_id, evaluator_name, evaluator_title, site_location, evaluation_date, practical_pass, created_at').in('enrollment_id', enrollmentIds).order('created_at', { ascending: false }),
    ]);
    certs = (certRes.data || []).filter(c => !c.revoked_at);
    evals = evalRes.data || [];
  }
  const certByEnroll: Record<string, any> = {};
  for (const c of certs) if (!certByEnroll[c.enrollment_id]) certByEnroll[c.enrollment_id] = c;
  const evalByEnroll: Record<string, any> = {};
  for (const ev of evals) if (ev.enrollment_id && !evalByEnroll[ev.enrollment_id]) evalByEnroll[ev.enrollment_id] = ev;

  const rows = (enrollments || [])
    .map(e => {
      const p = learnerById[e.user_id] || {};
      const cert = certByEnroll[e.id];
      const ev = evalByEnroll[e.id];
      return {
        name: p.full_name || '—',
        email: p.email || '—',
        status: e.passed ? 'Passed' : ((e.progress_pct ?? 0) >= 5 ? 'In progress' : 'Not started'),
        progress: Math.round(e.progress_pct ?? 0),
        certCode: cert?.verifier_code || null,
        certUrl: cert?.pdf_url || e.cert_url || null,
        issued: cert?.issued_at || null,
        expires: e.expires_at || null,
        evalResult: ev ? (ev.practical_pass ? 'Pass' : 'Fail') : 'Pending',
        evalDate: ev?.evaluation_date || null,
        evalBy: ev ? [ev.evaluator_name, ev.evaluator_title].filter(Boolean).join(', ') : null,
        evalSite: ev?.site_location || null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const brandName = brand === 'gfc' ? 'Forklift Certified' : 'Flat Earth Safety';

  const pdf = await PDFDocument.create();
  pdf.setTitle('OSHA Training Audit Pack');
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([PAGE.w, PAGE.h]);
  let y = PAGE.h - PAGE.margin;

  const newPage = () => {
    page = pdf.addPage([PAGE.w, PAGE.h]);
    y = PAGE.h - PAGE.margin;
  };
  const ensureRoom = (needed: number) => {
    if (y - needed < PAGE.margin) newPage();
  };
  const text = (s: string, opts: { x?: number; size?: number; font?: PDFFont; color?: any; dy?: number } = {}) => {
    page.drawText(s, { x: opts.x ?? PAGE.margin, y, size: opts.size ?? 10, font: opts.font ?? font, color: opts.color ?? DARK });
    y -= opts.dy ?? (opts.size ?? 10) + 6;
  };
  const hr = () => {
    page.drawLine({ start: { x: PAGE.margin, y }, end: { x: PAGE.w - PAGE.margin, y }, thickness: 0.75, color: LIGHT });
    y -= 14;
  };

  /* ── Cover / summary ── */
  page.drawRectangle({ x: 0, y: PAGE.h - 8, width: PAGE.w, height: 8, color: ORANGE });
  text(brandName.toUpperCase(), { size: 11, font: bold, color: GRAY, dy: 22 });
  text('OSHA Training Audit Pack', { size: 26, font: bold, dy: 34 });
  text('Powered industrial truck operator training records — 29 CFR 1910.178(l)', { size: 10, color: GRAY, dy: 24 });
  hr();
  text(`Prepared for: ${prof.full_name || prof.email || 'Training manager'}`, { size: 11, dy: 17 });
  text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { size: 11, dy: 24 });

  const counts = {
    total: rows.length,
    passed: rows.filter(r => r.status === 'Passed').length,
    evalDone: rows.filter(r => r.evalResult === 'Pass').length,
    expiring: rows.filter(r => r.expires && new Date(r.expires).getTime() < Date.now() + 90 * 86400000).length,
  };
  text('Summary', { size: 14, font: bold, dy: 20 });
  text(`Operators on roster: ${counts.total}`, { size: 11, dy: 16 });
  text(`Formal instruction passed: ${counts.passed} of ${counts.total}`, { size: 11, dy: 16 });
  text(`Practical evaluations on file: ${counts.evalDone} of ${counts.total}`, { size: 11, dy: 16 });
  text(`Certifications expiring within 90 days: ${counts.expiring}`, { size: 11, dy: 24 });
  text('This pack contains the operator roster with training status, practical evaluation records,', { size: 9, color: GRAY, dy: 13 });
  text('and each operator\u2019s certificate of completion. Each certificate carries a QR code and', { size: 9, color: GRAY, dy: 13 });
  text('verification number an inspector can use to confirm authenticity online.', { size: 9, color: GRAY, dy: 20 });

  /* ── Roster table ── */
  newPage();
  text('Operator Roster', { size: 16, font: bold, dy: 24 });
  const cols = [
    { label: 'Operator', x: PAGE.margin, w: 130 },
    { label: 'Status', x: 190, w: 60 },
    { label: 'Evaluation', x: 252, w: 70 },
    { label: 'Cert #', x: 324, w: 80 },
    { label: 'Issued', x: 406, w: 70 },
    { label: 'Expires', x: 478, w: 80 },
  ];
  const drawHeader = () => {
    for (const c of cols) page.drawText(c.label, { x: c.x, y, size: 8, font: bold, color: GRAY });
    y -= 12;
    page.drawLine({ start: { x: PAGE.margin, y }, end: { x: PAGE.w - PAGE.margin, y }, thickness: 0.75, color: LIGHT });
    y -= 12;
  };
  drawHeader();
  const clip = (s: string, f: PDFFont, size: number, maxW: number) => {
    let out = s;
    while (out.length > 1 && f.widthOfTextAtSize(out, size) > maxW) out = out.slice(0, -1);
    return out === s ? s : out.slice(0, -1) + '…';
  };
  for (const r of rows) {
    ensureRoom(34);
    if (y === PAGE.h - PAGE.margin) { text('Operator Roster (continued)', { size: 12, font: bold, dy: 20 }); drawHeader(); }
    page.drawText(clip(r.name, bold, 9, cols[0].w), { x: cols[0].x, y, size: 9, font: bold, color: DARK });
    page.drawText(clip(r.email, font, 7.5, cols[0].w + 50), { x: cols[0].x, y: y - 10, size: 7.5, font, color: GRAY });
    page.drawText(`${r.status} (${r.progress}%)`, { x: cols[1].x, y, size: 8.5, font, color: DARK });
    page.drawText(r.evalResult + (r.evalDate ? ` ${fmtDate(r.evalDate)}` : ''), { x: cols[2].x, y, size: 8.5, font, color: r.evalResult === 'Pass' ? rgb(0.02, 0.55, 0.35) : r.evalResult === 'Fail' ? rgb(0.8, 0.15, 0.15) : GRAY });
    page.drawText(r.certCode || '—', { x: cols[3].x, y, size: 8.5, font, color: DARK });
    page.drawText(fmtDate(r.issued), { x: cols[4].x, y, size: 8.5, font, color: DARK });
    page.drawText(fmtDate(r.expires), { x: cols[5].x, y, size: 8.5, font, color: DARK });
    y -= 30;
  }

  /* ── Evaluation records ── */
  const evalRows = rows.filter(r => r.evalResult !== 'Pending');
  if (evalRows.length) {
    newPage();
    text('Practical Evaluation Records', { size: 16, font: bold, dy: 20 });
    text('Employer hands-on evaluations per 29 CFR 1910.178(l)(2)(iii)', { size: 9, color: GRAY, dy: 20 });
    for (const r of evalRows) {
      ensureRoom(70);
      text(r.name, { size: 11, font: bold, dy: 16 });
      text(`Result: ${r.evalResult}${r.evalDate ? `  |  Date: ${fmtDate(r.evalDate)}` : ''}`, { size: 9.5, dy: 14 });
      if (r.evalBy) text(`Evaluator: ${r.evalBy}`, { size: 9.5, dy: 14 });
      if (r.evalSite) text(`Site: ${r.evalSite}`, { size: 9.5, dy: 14 });
      hr();
    }
  }

  /* ── Certificates appendix ── */
  const withCerts = rows.filter(r => r.certUrl);
  for (const r of withCerts) {
    try {
      const res = await fetch(r.certUrl!);
      if (!res.ok) continue;
      const bytes = await res.arrayBuffer();
      const certDoc = await PDFDocument.load(bytes);
      const pages = await pdf.copyPages(certDoc, certDoc.getPageIndices());
      for (const p of pages) pdf.addPage(p);
    } catch (err) {
      console.error(`audit-pack: failed to append certificate for ${r.email}`, err);
    }
  }

  const out = await pdf.save();
  return new Response(Buffer.from(out), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="osha-audit-pack-${new Date().toISOString().slice(0, 10)}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
