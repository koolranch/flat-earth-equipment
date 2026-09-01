import 'server-only';

import { supabaseService } from '@/lib/supabase/service.server';

/**
 * Read-only data for the public /trainer/demo page. Everything comes from the
 * dedicated demo trainer account (order below is labeled
 * demo_gfc_screenshot_seed and contains only fictional operators), so exposing
 * it without auth is intentional and safe.
 */
const DEMO_ORDER_ID = '29706fe8-1e91-4399-9a0a-d375ef285edf';

/**
 * The e2e test account holds a seat on the demo order. Its real identifiers
 * ("Demo Operator" / demo-operator-e2e@…) read as leftover test data on the
 * public demo page, so we present it as a realistic fictional persona.
 * Display-only: the DB row and e2e login are untouched.
 */
const DISPLAY_PERSONAS: Record<string, { name: string; email: string }> = {
  'demo-operator-e2e@getforkliftcertified.com': {
    name: 'Dana Whitfield',
    email: 'dwhitfield@example.com',
  },
};

function displayIdentity(profile: { full_name?: string | null; email?: string | null } | null | undefined) {
  const persona = profile?.email ? DISPLAY_PERSONAS[profile.email] : undefined;
  return {
    name: persona?.name || profile?.full_name || '—',
    email: persona?.email || profile?.email || '—',
  };
}

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

export type DemoFormerOperator = {
  learner_name: string;
  learner_email: string;
  released_at: string;
};

export type DemoDashboardData = {
  seats: { total: number; claimed: number; remaining: number };
  rows: DemoRosterRow[];
  former: DemoFormerOperator[];
};

export async function getDemoDashboardData(): Promise<DemoDashboardData> {
  const svc = supabaseService();

  const [{ data: usage }, { data: claims }, { data: releasedClaims }] = await Promise.all([
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
    svc
      .from('seat_claims')
      .select('user_id, released_at')
      .eq('order_id', DEMO_ORDER_ID)
      .not('released_at', 'is', null),
  ]);

  const releasedIds = (releasedClaims || []).map((c: any) => c.user_id).filter(Boolean);
  const { data: releasedProfiles } = releasedIds.length
    ? await svc.from('profiles').select('id, full_name, email').in('id', releasedIds)
    : { data: [] as any[] };
  const releasedProfileById: Record<string, any> = Object.fromEntries(
    (releasedProfiles || []).map((p: any) => [p.id, p]),
  );
  const former: DemoFormerOperator[] = (releasedClaims || [])
    .map((c: any) => {
      const identity = displayIdentity(releasedProfileById[c.user_id]);
      return {
        learner_name: identity.name,
        learner_email: identity.email,
        released_at: c.released_at,
      };
    })
    .sort((a, b) => new Date(b.released_at).getTime() - new Date(a.released_at).getTime());

  const learnerIds = (claims || []).map((c: any) => c.user_id).filter(Boolean);
  if (!learnerIds.length) {
    return { seats: { total: 10, claimed: 0, remaining: 10 }, rows: [], former };
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
    const identity = displayIdentity(profile);
    const cert = certByEnrollment[e.id];
    const evaluation = evalByEnrollment[e.id];
    const status: DemoRosterRow['status'] = e.passed
      ? 'passed'
      : (e.progress_pct || 0) >= 5
        ? 'in_progress'
        : 'not_started';
    return {
      enrollment_id: e.id,
      learner_name: identity.name,
      learner_email: identity.email,
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
    former,
  };
}

export type DemoEvaluation = {
  learner_name: string;
  evaluator_name: string | null;
  evaluator_title: string | null;
  site_location: string | null;
  evaluation_date: string | null;
  practical_pass: boolean | null;
  truck_type: string | null;
  notes: string | null;
  competencies: Record<string, boolean> | null;
};

/**
 * Read-only evaluation record for the demo page. Returns null unless the
 * enrollment belongs to one of the demo order's operators, so the public
 * route can never leak a real customer's evaluation.
 */
export async function getDemoEvaluation(enrollmentId: string): Promise<DemoEvaluation | null> {
  const svc = supabaseService();

  const { data: enrollment } = await svc
    .from('enrollments')
    .select('id, user_id')
    .eq('id', enrollmentId)
    .maybeSingle();
  if (!enrollment) return null;

  const { data: claim } = await svc
    .from('seat_claims')
    .select('id')
    .eq('order_id', DEMO_ORDER_ID)
    .eq('user_id', enrollment.user_id)
    .maybeSingle();
  if (!claim) return null;

  const [{ data: ev }, { data: profile }] = await Promise.all([
    svc
      .from('employer_evaluations')
      .select('evaluator_name, evaluator_title, site_location, evaluation_date, practical_pass, truck_type, notes, competencies')
      .eq('enrollment_id', enrollmentId)
      .maybeSingle(),
    svc.from('profiles').select('full_name, email').eq('id', enrollment.user_id).maybeSingle(),
  ]);
  if (!ev) return null;

  const identity = displayIdentity(profile);

  return {
    learner_name: identity.name === '—' ? 'Operator' : identity.name,
    evaluator_name: ev.evaluator_name,
    evaluator_title: ev.evaluator_title,
    site_location: ev.site_location,
    evaluation_date: ev.evaluation_date,
    practical_pass: ev.practical_pass,
    truck_type: ev.truck_type,
    notes: ev.notes,
    competencies: (ev.competencies as Record<string, boolean> | null) ?? null,
  };
}
