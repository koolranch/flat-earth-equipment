import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { getAuthUser } from '@/lib/supabase/mobile-auth';
import { buildAuditPackPdf } from '@/lib/training/auditPack.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * One-click OSHA audit pack: a single PDF containing a cover summary, the
 * full operator roster with certification + practical-evaluation status, and
 * every operator certificate appended, ready to hand to an inspector.
 * PDF assembly lives in lib/training/auditPack.server.ts.
 */
export async function GET(req: Request) {
  const svc = supabaseService();
  const { user } = await getAuthUser(req);
  if (!user) return NextResponse.json({ ok: false, error: 'auth_required' }, { status: 401 });
  const { data: prof } = await svc.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!prof || !['admin', 'trainer'].includes(prof.role)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const out = await buildAuditPackPdf(user.id);
  if (!out) return NextResponse.json({ ok: false, error: 'no_orders' }, { status: 404 });

  return new Response(Buffer.from(out), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="osha-audit-pack-${new Date().toISOString().slice(0, 10)}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
