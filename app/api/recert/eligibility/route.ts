import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'auth_required' }, { status: 401 });

  const { data: certs } = await svc
    .from('certificates')
    .select('id, issued_at, revoked, enrollment_id')
    .eq('revoked', false)
    .order('issued_at', { ascending: false })
    .limit(1);

  let last: any = null;
  // Join via enrollment->user (best effort if column exists)
  if (certs && certs.length) {
    const c = certs[0];
    // try to verify the certificate belongs to this user via enrollment
    try {
      const { data: e } = await svc.from('enrollments').select('id, user_id').eq('id', (c as any).enrollment_id).maybeSingle();
      if (e && (e as any).user_id === user.id) last = c;
    } catch { }
  }

  if (!last) return NextResponse.json({ ok: true, has_certificate: false, due: false });
  const lastIssued = new Date((last as any).issued_at);
  const currentUntil = new Date(lastIssued);
  currentUntil.setFullYear(currentUntil.getFullYear() + 3);
  const now = new Date();
  const due = now >= currentUntil;
  return NextResponse.json({ ok: true, has_certificate: true, last_issued_at: lastIssued.toISOString(), due, current_until: currentUntil.toISOString() });
}
