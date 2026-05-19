export type MobileManagerStats = {
  total_users: number;
  active_enrollments: number;
  completed_trainings: number;
  pending_certifications: number;
  compliance_rate: number;
  completion_rate: number;
  average_score: number;
  trends?: {
    enrollments_trend: number;
    completion_trend: number;
    compliance_trend: number;
  };
};

export type MobileManagerLearnerSource = {
  id: string;
  email: string | null;
  full_name: string | null;
  role?: string | null;
  enrollment_count?: number | null;
  completion_rate?: number | null;
  course?: string | null;
  course_slug?: string | null;
  progress_pct?: number | null;
  score?: number | null;
  status: 'active' | 'completed' | 'not_started' | 'in_progress' | 'passed';
  enrollment_date?: string | null;
  last_activity?: string | null;
};

export type MobilePracticalEvaluationSource = {
  user_id?: string;
  enrollment_id?: string;
  practical_pass?: boolean | null;
  evaluation_date?: string | null;
  evaluator_name?: string | null;
  finalized?: boolean | null;
} | null;

export type MobileCertificateSource = {
  user_id: string;
  certificate_id?: string | null;
  score?: number | null;
  pdf_url?: string | null;
  verification_code?: string | null;
  verify_code?: string | null;
  verifier_code?: string | null;
  issued_at?: string | null;
  issue_date?: string | null;
  revoked_at?: string | null;
} | null;

export type MobilePracticalEvaluationStatus = {
  status: 'not_ready' | 'needed' | 'passed' | 'failed';
  needs_practical_evaluation: boolean;
  needs_refresher: boolean;
};

export type MobileManagerLearnerRow = {
  id: string;
  email: string | null;
  full_name: string;
  role: string;
  course: {
    title: string | null;
    slug: string | null;
  };
  progress: {
    percent: number;
    enrollment_count: number;
    completion_rate: number;
    enrolled_at: string | null;
    last_activity_at: string | null;
  };
  status: 'not_started' | 'in_progress' | 'completed_online' | 'certified';
  needs_practical_evaluation: boolean;
  practical_evaluation: MobilePracticalEvaluationStatus & {
    enrollment_id: string | null;
    evaluation_date: string | null;
    evaluator_name: string | null;
    finalized: boolean;
  };
  certificate: {
    status: 'none' | 'issued' | 'revoked';
    id: string | null;
    score: number | null;
    pdf_url: string | null;
    verification_code: string | null;
    issued_at: string | null;
  };
};

export type MobileManagerDashboardSummary = {
  assigned_learners: number;
  active_training: number;
  online_complete: number;
  needs_practical_evaluation: number;
  certified_learners: number;
  completion_rate: number;
  compliance_rate: number;
  average_score: number;
  seats: {
    total: number;
    used: number;
    available: number;
  };
};

function coercePercent(value: number | null | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function isOnlineComplete(status: MobileManagerLearnerSource['status']) {
  return status === 'completed' || status === 'passed';
}

export function derivePracticalEvaluationStatus(
  learnerStatus: MobileManagerLearnerSource['status'],
  practical: Pick<NonNullable<MobilePracticalEvaluationSource>, 'practical_pass'> | null
): MobilePracticalEvaluationStatus {
  if (!isOnlineComplete(learnerStatus)) {
    return {
      status: 'not_ready',
      needs_practical_evaluation: false,
      needs_refresher: false,
    };
  }

  if (practical?.practical_pass === true) {
    return {
      status: 'passed',
      needs_practical_evaluation: false,
      needs_refresher: false,
    };
  }

  if (practical?.practical_pass === false) {
    return {
      status: 'failed',
      needs_practical_evaluation: false,
      needs_refresher: true,
    };
  }

  return {
    status: 'needed',
    needs_practical_evaluation: true,
    needs_refresher: false,
  };
}

export function buildMobileLearnerRow(
  learner: MobileManagerLearnerSource,
  enrichment: {
    practical?: MobilePracticalEvaluationSource;
    certificate?: MobileCertificateSource;
  } = {}
): MobileManagerLearnerRow {
  const practicalStatus = derivePracticalEvaluationStatus(
    learner.status,
    enrichment.practical ?? null
  );
  const certificate = enrichment.certificate;
  const certificateIssued = !!certificate?.certificate_id || !!certificate?.pdf_url;
  const certificateStatus = certificate?.revoked_at
    ? 'revoked'
    : certificateIssued
      ? 'issued'
      : 'none';

  let status: MobileManagerLearnerRow['status'];
  if (certificateStatus === 'issued' && practicalStatus.status === 'passed') {
    status = 'certified';
  } else if (isOnlineComplete(learner.status)) {
    status = 'completed_online';
  } else if ((learner.progress_pct || 0) > 0 || learner.status === 'in_progress') {
    status = 'in_progress';
  } else {
    status = 'not_started';
  }

  return {
    id: learner.id,
    email: learner.email,
    full_name: learner.full_name || learner.email?.split('@')[0] || 'Unknown learner',
    role: learner.role || 'learner',
    course: {
      title: learner.course || null,
      slug: learner.course_slug || null,
    },
    progress: {
      percent: coercePercent(learner.progress_pct),
      enrollment_count: learner.enrollment_count || 0,
      completion_rate: coercePercent(learner.completion_rate),
      enrolled_at: learner.enrollment_date || null,
      last_activity_at: learner.last_activity || null,
    },
    status,
    needs_practical_evaluation: practicalStatus.needs_practical_evaluation,
    practical_evaluation: {
      ...practicalStatus,
      enrollment_id: enrichment.practical?.enrollment_id || null,
      evaluation_date: enrichment.practical?.evaluation_date || null,
      evaluator_name: enrichment.practical?.evaluator_name || null,
      finalized: !!enrichment.practical?.finalized,
    },
    certificate: {
      status: certificateStatus,
      id: certificate?.certificate_id || null,
      score: certificate?.score ?? learner.score ?? null,
      pdf_url: certificate?.pdf_url || null,
      verification_code:
        certificate?.verification_code ||
        certificate?.verify_code ||
        certificate?.verifier_code ||
        null,
      issued_at: certificate?.issued_at || certificate?.issue_date || null,
    },
  };
}

export function summarizeMobileManagerDashboard({
  stats,
  seatTotals,
  learners,
}: {
  stats: MobileManagerStats;
  seatTotals?: { total?: number; used?: number; available?: number } | null;
  learners: MobileManagerLearnerRow[];
}): MobileManagerDashboardSummary {
  return {
    assigned_learners: stats.total_users,
    active_training: stats.active_enrollments,
    online_complete: stats.completed_trainings,
    needs_practical_evaluation: learners.filter((learner) => learner.needs_practical_evaluation).length,
    certified_learners: learners.filter((learner) => learner.certificate.status === 'issued').length,
    completion_rate: coercePercent(stats.completion_rate),
    compliance_rate: coercePercent(stats.compliance_rate),
    average_score: coercePercent(stats.average_score),
    seats: {
      total: seatTotals?.total || 0,
      used: seatTotals?.used || 0,
      available: seatTotals?.available || 0,
    },
  };
}
