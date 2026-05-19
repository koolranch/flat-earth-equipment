import { NextResponse } from 'next/server';
import { requireMobileManagerContext } from '@/lib/enterprise/mobile-manager.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const context = await requireMobileManagerContext(request, url.searchParams.get('org_id'));
  if ('error' in context) return context.error;

  return NextResponse.json({
    ok: true,
    org_id: context.orgId,
    role: context.role,
    tabs: [
      { id: 'team', label: 'Team', endpoint: '/api/mobile/manager/team' },
      { id: 'invites', label: 'Invites', endpoint: '/api/mobile/manager/invites' },
      { id: 'evaluations', label: 'Evaluations', endpoint: '/api/mobile/manager/evaluations' },
      { id: 'certificates', label: 'Certificates', endpoint: '/api/mobile/manager/certificates' },
    ],
    roster_filters: [
      { id: 'all', label: 'All' },
      { id: 'active', label: 'In Progress' },
      { id: 'completed', label: 'Completed Online' },
      { id: 'needs_practical', label: 'Needs Practical' },
      { id: 'certified', label: 'Certified' },
    ],
    copy: {
      online_complete: 'Online training complete',
      practical_needed: 'Practical evaluation needed',
      certificate_on_file: 'Certificate on file',
      seats_available: 'Seats available',
      compliance_note: 'Training records support OSHA 29 CFR 1910.178 requirements. This is not a state-issued license.',
    },
  });
}
