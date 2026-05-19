import { NextResponse } from 'next/server';
import { getMobileManagerLearners, requireMobileManagerContext } from '@/lib/enterprise/mobile-manager.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function readStatus(value: string | null): 'all' | 'active' | 'completed' {
  return value === 'active' || value === 'completed' ? value : 'all';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const context = await requireMobileManagerContext(request, url.searchParams.get('org_id'));
  if ('error' in context) return context.error;

  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') || '25')));
  const managerId = context.role === 'manager' ? context.userId : undefined;
  const result = await getMobileManagerLearners({
    orgId: context.orgId,
    managerId,
    page,
    pageSize,
    search: url.searchParams.get('search') || undefined,
    status: readStatus(url.searchParams.get('status')),
  });

  return NextResponse.json({
    ok: true,
    org_id: context.orgId,
    role: context.role,
    ...result,
  });
}
