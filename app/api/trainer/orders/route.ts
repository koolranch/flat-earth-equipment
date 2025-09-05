import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

async function isStaff(uid: string) {
  const svc = supabaseService();
  const { data } = await svc.from('profiles').select('role').eq('id', uid).maybeSingle();
  return !!data && ['admin', 'trainer'].includes((data as any).role);
}

export async function GET(req: Request) {
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'auth_required' }, { status: 401 });
  if (!(await isStaff(user.id))) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get('pageSize') || '50')));

  // Fetch orders for this trainer
  const { data: orders, error } = await svc
    .from('orders')
    .select('id, course_id, course_slug, seats, amount_cents, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const orderIds = (orders || []).map(o => (o as any).id);
  let seatMap: Record<string, { claimed: number }> = {};

  // Use view if exists, else count seat_claims
  try {
    const { data: viewRows } = await svc.from('v_order_seat_usage').select('order_id, claimed').in('order_id', orderIds);
    if (viewRows) viewRows.forEach((r: any) => { seatMap[r.order_id] = { claimed: Number(r.claimed) || 0 }; });
  } catch {
    const { data: claims } = await svc.from('seat_claims').select('order_id, id').in('order_id', orderIds);
    (claims || []).forEach((c: any) => { seatMap[c.order_id] = seatMap[c.order_id] || { claimed: 0 }; seatMap[c.order_id].claimed += 1; });
  }

  const rows = (orders || []).map((o: any) => {
    const claimed = seatMap[o.id]?.claimed || 0;
    const remaining = Math.max(0, (o.seats || 0) - claimed);
    return {
      order_id: o.id,
      course_slug: o.course_slug || 'forklift_operator',
      seats: o.seats || 0,
      claimed,
      remaining,
      amount_cents: o.amount_cents || 0,
      created_at: o.created_at
    };
  });

  const total = rows.length;
  const start = (page - 1) * pageSize;
  const paged = rows.slice(start, start + pageSize);
  return NextResponse.json({ ok: true, items: paged, total, page, pageSize });
}
