// Free a departed operator's seat so it can be reassigned to a new hire.
// Soft release: sets seat_claims.released_at/released_by. Training records
// (enrollments, certificates, employer_evaluations) are never touched — OSHA
// requires employers keep them — and a rehire reactivates the same claim row
// via the claim flow's upsert.

import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { getAuthUser } from '@/lib/supabase/mobile-auth';
import { auditLog } from '@/lib/audit/log.server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { user, client } = await getAuthUser(req);
  if (!user || !client) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const { data: prof } = await client.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!prof || !['trainer', 'admin'].includes(prof.role)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const learnerId = typeof body.learner_id === 'string' ? body.learner_id : '';
  if (!learnerId) {
    return NextResponse.json({ ok: false, error: 'missing_learner_id' }, { status: 400 });
  }

  const svc = supabaseService();

  // Ownership: the seat must sit on one of this trainer's orders (mirrors the
  // roster and reminder scoping).
  const { data: trainerOrders } = await svc.from('orders').select('id').eq('user_id', user.id);
  const orderIds = (trainerOrders || []).map((o) => o.id);
  if (!orderIds.length) {
    return NextResponse.json({ ok: false, error: 'not_your_learner' }, { status: 403 });
  }

  const { data: claims } = await svc
    .from('seat_claims')
    .select('id, order_id')
    .eq('user_id', learnerId)
    .in('order_id', orderIds)
    .is('released_at', null);

  if (!claims || claims.length === 0) {
    return NextResponse.json({ ok: false, error: 'no_active_seat' }, { status: 404 });
  }

  const { error } = await svc
    .from('seat_claims')
    .update({ released_at: new Date().toISOString(), released_by: user.id })
    .in('id', claims.map((c) => c.id));

  if (error) {
    console.error('seat release failed:', error);
    return NextResponse.json({ ok: false, error: 'release_failed' }, { status: 500 });
  }

  try {
    await auditLog({
      actor_id: user.id,
      action: 'seat_released',
      entity: 'seat_claims',
      meta: { learner_id: learnerId, order_ids: claims.map((c) => c.order_id) },
    });
  } catch {}

  return NextResponse.json({ ok: true, released: claims.length });
}
