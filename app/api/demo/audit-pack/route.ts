import { NextResponse } from 'next/server';
import { buildAuditPackPdf } from '@/lib/training/auditPack.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Public sample audit pack for the /trainer/demo page. Hardcoded to the seeded
 * demo trainer account (fictional operators only), so serving it without auth
 * is intentional — same posture as the demo dashboard itself.
 */
const DEMO_TRAINER_ID = '32f4b6c1-72f6-4d9c-913e-5f5288152674';

export async function GET() {
  const out = await buildAuditPackPdf(DEMO_TRAINER_ID);
  if (!out) return NextResponse.json({ ok: false, error: 'demo_unavailable' }, { status: 404 });

  return new Response(Buffer.from(out), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="sample-osha-audit-pack.pdf"',
      // Cheap to rebuild, but cache at the edge so a demo-page crowd can't
      // hammer PDF assembly.
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
