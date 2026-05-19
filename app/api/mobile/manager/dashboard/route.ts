import { NextResponse } from 'next/server';
import { getMobileManagerDashboard, requireMobileManagerContext } from '@/lib/enterprise/mobile-manager.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const context = await requireMobileManagerContext(request, url.searchParams.get('org_id'));
  if ('error' in context) return context.error;

  const managerId = context.role === 'manager' ? context.userId : undefined;
  const dashboard = await getMobileManagerDashboard({
    orgId: context.orgId,
    managerId,
  });

  if (!dashboard) {
    return NextResponse.json({ ok: false, error: 'Organization not found' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    org_id: context.orgId,
    role: context.role,
    data: dashboard,
  });
}
