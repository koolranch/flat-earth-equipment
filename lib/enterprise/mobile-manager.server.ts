import 'server-only';

import { getAdaptedOrganizationStats, getOrganizationUsers } from '@/lib/enterprise/adapted-database.server';
import {
  buildMobileLearnerRow,
  summarizeMobileManagerDashboard,
  type MobileCertificateSource,
  type MobileManagerLearnerRow,
  type MobilePracticalEvaluationSource,
} from '@/lib/enterprise/mobile-manager';
import { getAuthUser } from '@/lib/supabase/mobile-auth';
import { supabaseService } from '@/lib/supabase/service.server';

const MANAGER_ROLES = new Set(['owner', 'admin', 'manager', 'trainer', 'super_admin']);

type ManagerContext = {
  userId: string;
  orgId: string;
  role: string;
};

export async function requireMobileManagerContext(
  request: Request,
  requestedOrgId?: string | null
): Promise<ManagerContext | { error: Response }> {
  const { user } = await getAuthUser(request);
  if (!user) {
    return {
      error: Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const svc = supabaseService();
  let membershipQuery = svc
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id);

  if (requestedOrgId) {
    membershipQuery = membershipQuery.eq('org_id', requestedOrgId);
  }

  const { data: memberships } = await membershipQuery;
  const membership = (memberships || []).find((row) =>
    MANAGER_ROLES.has(String(row.role || '').toLowerCase())
  );

  if (!membership) {
    return {
      error: Response.json({ ok: false, error: 'Manager access required' }, { status: 403 }),
    };
  }

  return {
    userId: user.id,
    orgId: membership.org_id,
    role: membership.role,
  };
}

export async function getMobileManagerLearners({
  orgId,
  managerId,
  page,
  pageSize,
  search,
  status,
}: {
  orgId: string;
  managerId?: string;
  page: number;
  pageSize: number;
  search?: string;
  status?: 'all' | 'active' | 'completed';
}): Promise<{
  learners: MobileManagerLearnerRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const result = await getOrganizationUsers(orgId, {
    page,
    pageSize,
    search,
    status,
    managerId,
  });
  const userIds = Array.from(new Set(result.users.map((user) => user.id).filter(Boolean)));
  const [evaluations, certificates] = await Promise.all([
    getEvaluationMap(orgId, userIds),
    getCertificateMap(orgId, userIds),
  ]);

  return {
    learners: result.users.map((user) =>
      buildMobileLearnerRow(user, {
        practical: evaluations.get(user.id) || null,
        certificate: certificates.get(user.id) || null,
      })
    ),
    total: result.total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(result.total / pageSize)),
  };
}

export async function getMobileManagerDashboard({
  orgId,
  managerId,
}: {
  orgId: string;
  managerId?: string;
}) {
  const [stats, team, seats] = await Promise.all([
    getAdaptedOrganizationStats(orgId, managerId),
    getMobileManagerLearners({ orgId, managerId, page: 1, pageSize: 100, status: 'all' }),
    getOrgSeatTotals(orgId),
  ]);

  if (!stats) {
    return null;
  }

  return {
    summary: summarizeMobileManagerDashboard({
      stats,
      seatTotals: seats,
      learners: team.learners,
    }),
    stats,
    seats,
    samples: {
      needs_practical_evaluation: team.learners
        .filter((learner) => learner.needs_practical_evaluation)
        .slice(0, 5),
      recent_learners: team.learners.slice(0, 5),
    },
  };
}

export async function getMobileEvaluationRows({
  orgId,
  managerId,
  status,
}: {
  orgId: string;
  managerId?: string;
  status?: 'queue' | 'history' | 'all';
}) {
  const team = await getMobileManagerLearners({ orgId, managerId, page: 1, pageSize: 500, status: 'all' });

  if (status === 'queue') {
    return team.learners.filter((learner) => learner.needs_practical_evaluation);
  }

  if (status === 'history') {
    return team.learners.filter((learner) =>
      ['passed', 'failed'].includes(learner.practical_evaluation.status)
    );
  }

  return team.learners;
}

async function getOrgSeatTotals(orgId: string) {
  const { data } = await supabaseService()
    .from('org_seats')
    .select('total_seats, allocated_seats')
    .eq('org_id', orgId);

  return (data || []).reduce(
    (acc, seat) => {
      const total = seat.total_seats || 0;
      const used = seat.allocated_seats || 0;
      acc.total += total;
      acc.used += used;
      acc.available += Math.max(0, total - used);
      return acc;
    },
    { total: 0, used: 0, available: 0 }
  );
}

async function getEvaluationMap(orgId: string, userIds: string[]) {
  const map = new Map<string, MobilePracticalEvaluationSource>();
  if (userIds.length === 0) return map;

  const svc = supabaseService();
  const { data: enrollments } = await svc
    .from('enrollments')
    .select('id, user_id')
    .eq('org_id', orgId)
    .in('user_id', userIds);
  const enrollmentIds = (enrollments || []).map((enrollment) => enrollment.id);
  if (enrollmentIds.length === 0) return map;

  const enrollmentUserMap = new Map((enrollments || []).map((enrollment) => [enrollment.id, enrollment.user_id]));
  const { data: evaluations } = await svc
    .from('employer_evaluations')
    .select('enrollment_id, practical_pass, evaluation_date, evaluator_name, finalized')
    .in('enrollment_id', enrollmentIds);

  for (const evaluation of evaluations || []) {
    const userId = enrollmentUserMap.get(evaluation.enrollment_id);
    if (!userId) continue;
    map.set(userId, {
      user_id: userId,
      enrollment_id: evaluation.enrollment_id,
      practical_pass: evaluation.practical_pass,
      evaluation_date: evaluation.evaluation_date,
      evaluator_name: evaluation.evaluator_name,
      finalized: evaluation.finalized,
    });
  }

  return map;
}

async function getCertificateMap(orgId: string, userIds: string[]) {
  const map = new Map<string, MobileCertificateSource>();
  if (userIds.length === 0) return map;

  const svc = supabaseService();
  const { data: enrollments } = await svc
    .from('enrollments')
    .select('id, user_id')
    .eq('org_id', orgId)
    .in('user_id', userIds);
  const allowedUserIds = Array.from(new Set((enrollments || []).map((enrollment) => enrollment.user_id)));
  if (allowedUserIds.length === 0) return map;

  const { data: certificates } = await svc
    .from('certificates')
    .select('id, learner_id, user_id, score, pdf_url, verification_code, verify_code, verifier_code, issued_at, issue_date, revoked_at')
    .or(`learner_id.in.(${allowedUserIds.join(',')}),user_id.in.(${allowedUserIds.join(',')})`);

  for (const certificate of certificates || []) {
    const userId = certificate.learner_id || certificate.user_id;
    if (!userId) continue;
    const current = map.get(userId);
    if (!current || (certificate.score || 0) > (current.score || 0)) {
      map.set(userId, {
        user_id: userId,
        certificate_id: certificate.id,
        score: certificate.score,
        pdf_url: certificate.pdf_url,
        verification_code: certificate.verification_code,
        verify_code: certificate.verify_code,
        verifier_code: certificate.verifier_code,
        issued_at: certificate.issued_at,
        issue_date: certificate.issue_date,
        revoked_at: certificate.revoked_at,
      });
    }
  }

  return map;
}
