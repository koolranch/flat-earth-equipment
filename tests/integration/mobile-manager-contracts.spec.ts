import { expect, test } from '@playwright/test';
import {
  buildMobileLearnerRow,
  derivePracticalEvaluationStatus,
  summarizeMobileManagerDashboard,
  type MobileManagerLearnerSource,
} from '../../lib/enterprise/mobile-manager';

test('mobile manager learner rows expose stable progress, certificate, and practical evaluation flags', () => {
  const source: MobileManagerLearnerSource = {
    id: 'learner-1',
    email: 'operator@example.com',
    full_name: 'Operator One',
    role: 'learner',
    enrollment_count: 1,
    completion_rate: 100,
    course: 'Forklift Operator Training',
    course_slug: 'forklift',
    progress_pct: 100,
    status: 'completed',
    enrollment_date: '2026-05-01T00:00:00.000Z',
    last_activity: '2026-05-10T00:00:00.000Z',
  };

  const row = buildMobileLearnerRow(source, {
    practical: {
      user_id: 'learner-1',
      enrollment_id: 'enrollment-1',
      practical_pass: null,
    },
    certificate: {
      user_id: 'learner-1',
      score: 88,
      certificate_id: 'cert-1',
      pdf_url: 'https://example.com/cert.pdf',
      verification_code: 'ABC123',
      issued_at: '2026-05-11T00:00:00.000Z',
    },
  });

  expect(row.id).toBe('learner-1');
  expect(row.status).toBe('completed_online');
  expect(row.needs_practical_evaluation).toBe(true);
  expect(row.practical_evaluation.status).toBe('needed');
  expect(row.certificate.status).toBe('issued');
  expect(row.certificate.pdf_url).toBe('https://example.com/cert.pdf');
});

test('mobile practical status treats failed evaluations as refresher needed', () => {
  expect(derivePracticalEvaluationStatus('completed', { practical_pass: false })).toEqual({
    status: 'failed',
    needs_practical_evaluation: false,
    needs_refresher: true,
  });
});

test('mobile dashboard summary counts pending practical and certified learners from shaped rows', () => {
  const learners = [
    buildMobileLearnerRow(
      {
        id: 'learner-1',
        email: 'one@example.com',
        full_name: 'One',
        role: 'learner',
        enrollment_count: 1,
        completion_rate: 100,
        course: 'Forklift',
        course_slug: 'forklift',
        progress_pct: 100,
        status: 'completed',
        enrollment_date: null,
        last_activity: null,
      },
      { practical: { practical_pass: null }, certificate: null }
    ),
    buildMobileLearnerRow(
      {
        id: 'learner-2',
        email: 'two@example.com',
        full_name: 'Two',
        role: 'learner',
        enrollment_count: 1,
        completion_rate: 100,
        course: 'Forklift',
        course_slug: 'forklift',
        progress_pct: 100,
        status: 'completed',
        enrollment_date: null,
        last_activity: null,
      },
      {
        practical: { practical_pass: true },
        certificate: { user_id: 'learner-2', score: 91, certificate_id: 'cert-2' },
      }
    ),
  ];

  expect(
    summarizeMobileManagerDashboard({
      stats: {
        total_users: 2,
        active_enrollments: 0,
        completed_trainings: 2,
        pending_certifications: 0,
        compliance_rate: 100,
        completion_rate: 100,
        average_score: 90,
        trends: { enrollments_trend: 0, completion_trend: 0, compliance_trend: 0 },
      },
      seatTotals: { total: 10, used: 2, available: 8 },
      learners,
    })
  ).toMatchObject({
    assigned_learners: 2,
    online_complete: 2,
    needs_practical_evaluation: 1,
    certified_learners: 1,
    seats: { total: 10, used: 2, available: 8 },
  });
});
