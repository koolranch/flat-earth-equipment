import { NextResponse } from 'next/server';
import { getMobileEvaluationRows, requireMobileManagerContext } from '@/lib/enterprise/mobile-manager.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function readStatus(value: string | null): 'queue' | 'history' | 'all' {
  if (value === 'history' || value === 'all') return value;
  return 'queue';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const context = await requireMobileManagerContext(request, url.searchParams.get('org_id'));
  if ('error' in context) return context.error;

  const managerId = context.role === 'manager' ? context.userId : undefined;
  const status = readStatus(url.searchParams.get('status'));
  const learners = await getMobileEvaluationRows({
    orgId: context.orgId,
    managerId,
    status,
  });

  return NextResponse.json({
    ok: true,
    org_id: context.orgId,
    role: context.role,
    status,
    count: learners.length,
    evaluations: learners.map((learner) => ({
      learner_id: learner.id,
      learner_name: learner.full_name,
      learner_email: learner.email,
      course: learner.course,
      progress: learner.progress,
      practical_evaluation: learner.practical_evaluation,
      certificate: learner.certificate,
      needs_practical_evaluation: learner.needs_practical_evaluation,
    })),
  });
}
