# Mobile Manager Contracts

This document is the native iOS/Android handoff for the Forklift Certified manager experience.

## Auth
- Mobile clients should send `Authorization: Bearer <supabase-access-token>`.
- Web cookie auth remains supported on the same routes.
- Manager access is based on `org_members.role` values: `owner`, `admin`, `manager`, `trainer`, `super_admin`.

## Native-Facing Endpoints

### Dashboard
`GET /api/mobile/manager/dashboard?org_id=<optional>`

Returns org-scoped summary cards and samples for the Team tab.

```ts
type DashboardResponse = {
  ok: true;
  org_id: string;
  role: string;
  data: {
    summary: {
      assigned_learners: number;
      active_training: number;
      online_complete: number;
      needs_practical_evaluation: number;
      certified_learners: number;
      completion_rate: number;
      compliance_rate: number;
      average_score: number;
      seats: { total: number; used: number; available: number };
    };
    samples: {
      needs_practical_evaluation: LearnerRow[];
      recent_learners: LearnerRow[];
    };
  };
};
```

### Team
`GET /api/mobile/manager/team?org_id=<optional>&page=1&pageSize=25&search=&status=all`

```ts
type LearnerRow = {
  id: string;
  email: string | null;
  full_name: string;
  role: string;
  course: { title: string | null; slug: string | null };
  progress: {
    percent: number;
    enrollment_count: number;
    completion_rate: number;
    enrolled_at: string | null;
    last_activity_at: string | null;
  };
  status: 'not_started' | 'in_progress' | 'completed_online' | 'certified';
  needs_practical_evaluation: boolean;
  practical_evaluation: {
    status: 'not_ready' | 'needed' | 'passed' | 'failed';
    needs_practical_evaluation: boolean;
    needs_refresher: boolean;
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
```

### Invites
`GET /api/mobile/manager/invites?org_id=<optional>&course_id=<optional>`

`POST /api/mobile/manager/invites?org_id=<optional>`

```ts
type CreateInviteBody = {
  emails: string[];
  role?: 'learner' | 'manager' | 'admin';
  course_id?: string;
};
```

### Evaluations
`GET /api/mobile/manager/evaluations?org_id=<optional>&status=queue|history|all`

Use `queue` for learners who completed online training and need hands-on practical evaluation.

### Certificates
`GET /api/mobile/manager/certificates?org_id=<optional>`

Returns completed learners with issued or revoked certificate records and verification/PDF fields.

## Mobile IA

### Team Tab
- Org header with role badge and last refreshed time.
- KPI cards: Available Seats, Assigned Learners, Online Complete, Needs Practical.
- Filter chips: All, In Progress, Completed Online, Needs Practical, Certified.
- Learner cards sorted by action need first, then recent activity.

### Learner Detail
- Identity, course, and enrollment date.
- Online training progress and last activity.
- Practical evaluation state and evaluator/date.
- Certificate state, score, verification code, and PDF link.
- Manager actions: evaluate, invite/resend, assign course, view certificate.

### Invite Flow
- Pick course and show seat availability before entering emails.
- Paste or enter emails, then review valid and invalid rows.
- Confirm send, then show sent/claimed/expired tracking.

### Evaluations
- Queue: completed online and practical evaluation needed.
- History: passed, failed/needs refresher, finalized records.
- Detail: checklist, evaluator, location, signature state, certificate impact.

## Design Tone
- Use operational language: `Online training complete`, `Practical evaluation needed`, `Certificate on file`, `Seats available`.
- Avoid gamification, rewards language, streaks, or “license” wording.
- Use compliance context carefully: OSHA 29 CFR 1910.178 training records, not state-issued licenses.
