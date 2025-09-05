import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

type Filters = { q?: string; status?: 'all' | 'not_started' | 'in_progress' | 'passed'; course_slug?: string; from?: string; to?: string; page?: number; pageSize?: number };

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
  const f: Filters = {
    q: url.searchParams.get('q') || undefined,
    status: (url.searchParams.get('status') as any) || 'all',
    course_slug: url.searchParams.get('course_slug') || undefined,
    from: url.searchParams.get('from') || undefined,
    to: url.searchParams.get('to') || undefined,
    page: Number(url.searchParams.get('page') || '1') || 1,
    pageSize: Math.min(200, Number(url.searchParams.get('pageSize') || '50') || 50),
  };

  // 1) Trainer orders
  let ordersQ = svc.from('orders').select('id, course_id, course_slug').eq('user_id', user.id);
  if (f.course_slug) ordersQ = ordersQ.eq('course_slug', f.course_slug);
  const { data: orders } = await ordersQ;
  const orderIds = (orders || []).map(o => o.id);
  if (!orderIds.length) return NextResponse.json({ ok: true, items: [], total: 0, page: f.page, pageSize: f.pageSize });

  // 2) Seats claimed under those orders
  const { data: claims } = await svc.from('seat_claims').select('id, order_id, user_id, created_at');
  const claimsByOrder = (claims || []).filter(c => orderIds.includes((c as any).order_id));
  const learnerIds = Array.from(new Set(claimsByOrder.map(c => (c as any).user_id)));
  if (!learnerIds.length) return NextResponse.json({ ok: true, items: [], total: 0, page: f.page, pageSize: f.pageSize });

  // 3) Learner profiles
  const { data: learners } = await svc.from('profiles').select('id, full_name, email').in('id', learnerIds);
  const learnerById: Record<string, any> = Object.fromEntries((learners || []).map(l => [l.id, l]));

  // 4) Enrollments for those learners and these courses
  const courseIds = Array.from(new Set((orders || []).map(o => (o as any).course_id).filter(Boolean)));
  let enrollQ = svc.from('enrollments').select('id, user_id, course_id, course_slug, progress_pct, passed, created_at, updated_at').in('user_id', learnerIds);
  if (f.course_slug) enrollQ = enrollQ.eq('course_slug', f.course_slug);
  const { data: enrollments } = await enrollQ;
  const enrollmentIds = (enrollments || []).map(e => e.id);

  // 5) Latest certificates per enrollment
  let certs: any[] = [];
  try {
    const { data } = await svc.from('certificates').select('id, enrollment_id, pdf_url, issued_at, revoked').in('enrollment_id', enrollmentIds).order('issued_at', { ascending: false });
    certs = data || [];
  } catch { certs = []; }
  const latestCertByEnroll: Record<string, any> = {};
  for (const c of certs) { const eid = (c as any).enrollment_id; if (!latestCertByEnroll[eid]) latestCertByEnroll[eid] = c; }

  // Compose rows
  let rows = (enrollments || []).map(e => {
    const p = learnerById[(e as any).user_id] || {};
    const cert = latestCertByEnroll[(e as any).id];
    const status = (e as any).passed ? 'passed' : ((e as any).progress_pct >= 5 ? 'in_progress' : 'not_started');
    return {
      enrollment_id: e.id,
      learner_id: (e as any).user_id,
      learner_name: p.full_name || '—',
      learner_email: p.email || '—',
      course_slug: (e as any).course_slug || 'forklift_operator',
      progress_pct: (e as any).progress_pct ?? 0,
      passed: !!(e as any).passed,
      status,
      cert_pdf_url: cert?.pdf_url || null,
      cert_issued_at: cert?.issued_at || null,
      updated_at: (e as any).updated_at,
      created_at: (e as any).created_at,
    };
  });

  // 6) Filter: q and date range and status
  if (f.q) {
    const q = f.q.toLowerCase();
    rows = rows.filter(r => (r.learner_name || '').toLowerCase().includes(q) || (r.learner_email || '').toLowerCase().includes(q));
  }
  if (f.status && f.status !== 'all') rows = rows.filter(r => r.status === f.status);
  if (f.from) { const d = new Date(f.from); rows = rows.filter(r => new Date(r.created_at) >= d); }
  if (f.to) { const d = new Date(f.to); rows = rows.filter(r => new Date(r.created_at) <= d); }

  // 7) Sort (newest first by updated_at)
  rows.sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());

  const total = rows.length;
  const start = (f.page! - 1) * f.pageSize!;
  const paged = rows.slice(start, start + f.pageSize!);

  const res = NextResponse.json({ ok: true, items: paged, total, page: f.page, pageSize: f.pageSize });
  res.headers.set('Cache-Control', 'no-store');
  return res;
}