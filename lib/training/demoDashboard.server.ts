import 'server-only';

import { supabaseService } from '@/lib/supabase/service.server';

/**
 * Read-only data for the public /trainer/demo page. Everything comes from the
 * dedicated demo trainer account (order below is labeled
 * demo_gfc_screenshot_seed and contains only fictional operators), so exposing
 * it without auth is intentional and safe.
 */
const DEMO_ORDER_ID = '29706fe8-1e91-4399-9a0a-d375ef285edf';

export type DemoRosterRow = {
  enrollment_id: string;
  learner_name: string;
  learner_email: string;
  progress_pct: number;
  status: 'not_started' | 'in_progress' | 'passed';
  practical_pass: boolean | null;
  expires_at: string | null;
  cert_pdf_url: string | null;
};

export type DemoDashboardData = {
  seats: { total: number; claimed: number; remaining: number };
  rows: DemoRosterRow[];
};

export async function getDemoDashboardData(): Promise<DemoDashboardData> {
  const svc = supabaseService();

  const [{ data: usage }, { data: claims }] = await Promise.all([
    svc
      .from('v_order_seat_usage')
      .select('total_seats, claimed, remaining')
      .eq('order_id', DEMO_ORDER_ID)
      .maybeSingle(),
    svc
      .from('seat_claims')
      .select('user_id')
      .eq('order_id', DEMO_ORDER_ID)
      .is('released_at', null),
  ]);

  const learnerIds = (claims || []).map((c: any) => c.user_id).filter(Boolean);
  if (!learnerIds.length) {
    return { seats: { total: 10, claimed: 0, remaining: 10 }, rows: [] };
  }

  const [{ data: profiles }, { data: enrollments }] = await Promise.all([
    svc.from('profiles').select('id, full_name, email').in('id', learnerIds),
    svc
      .from('enrollments')
      .select('id, user_id, progress_pct, passed, cert_url, expires_at, created_at')
      .in('user_id', learnerIds),
  ]);

  const profileById: Record<string, any> = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));
  const enrollmentIds = (enrollments || []).map((e: any) => e.id);

  const [{ data: certs }, { data: evals }] = await Promise.all([
    svc
      .from('certificates')
      .select('enrollment_id, pdf_url, issued_at, revoked_at')
      .in('enrollment_id', enrollmentIds)
      .order('issued_at', { ascending: false }),
    svc
      .from('employer_evaluations')
      .select('enrollment_id, practical_pass, created_at')
      .in('enrollment_id', enrollmentIds)
      .order('created_at', { ascending: false }),
  ]);

  const certByEnrollment: Record<string, any> = {};
  for (const c of certs || []) {
    if (!(c as any).revoked_at && !certByEnrollment[(c as any).enrollment_id]) {
      certByEnrollment[(c as any).enrollment_id] = c;
    }
  }
  const evalByEnrollment: Record<string, any> = {};
  for (const ev of evals || []) {
    if (!evalByEnrollment[(ev as any).enrollment_id]) evalByEnrollment[(ev as any).enrollment_id] = ev;
  }

  const rows: DemoRosterRow[] = (enrollments || []).map((e: any) => {
    const profile = profileById[e.user_id] || {};
    const cert = certByEnrollment[e.id];
    const evaluation = evalByEnrollment[e.id];
    const status: DemoRosterRow['status'] = e.passed
      ? 'passed'
      : (e.progress_pct || 0) >= 5
        ? 'in_progress'
        : 'not_started';
    return {
      enrollment_id: e.id,
      learner_name: profile.full_name || '—',
      learner_email: profile.email || '—',
      progress_pct: Math.round(e.progress_pct || 0),
      status,
      practical_pass: evaluation ? !!evaluation.practical_pass : null,
      expires_at: e.expires_at || null,
      cert_pdf_url: cert?.pdf_url || e.cert_url || null,
    };
  });

  // Passed first, then in progress — mirrors how the dashboard reads best.
  rows.sort((a, b) => b.progress_pct - a.progress_pct);

  return {
    seats: {
      total: Number(usage?.total_seats ?? 10),
      claimed: Number(usage?.claimed ?? rows.length),
      remaining: Number(usage?.remaining ?? 0),
    },
    rows,
  };
}
