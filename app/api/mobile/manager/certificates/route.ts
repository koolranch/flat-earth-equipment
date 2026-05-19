import { NextResponse } from 'next/server';
import { getMobileManagerLearners, requireMobileManagerContext } from '@/lib/enterprise/mobile-manager.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const context = await requireMobileManagerContext(request, url.searchParams.get('org_id'));
  if ('error' in context) return context.error;

  const managerId = context.role === 'manager' ? context.userId : undefined;
  const team = await getMobileManagerLearners({
    orgId: context.orgId,
    managerId,
    page: 1,
    pageSize: 500,
    status: 'completed',
  });
  const certificates = team.learners
    .filter((learner) => learner.certificate.status !== 'none')
    .map((learner) => ({
      learner_id: learner.id,
      learner_name: learner.full_name,
      learner_email: learner.email,
      course: learner.course,
      certificate: learner.certificate,
      practical_evaluation: learner.practical_evaluation,
    }));

  return NextResponse.json({
    ok: true,
    org_id: context.orgId,
    role: context.role,
    count: certificates.length,
    certificates,
  });
}
