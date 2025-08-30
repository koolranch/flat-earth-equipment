// app/api/admin/roster/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { fetchRoster } from '@/lib/admin/roster.server';
import { requireAdminServer } from '@/lib/admin/guard';
import { logAdminAction } from '@/lib/admin/utils';

export async function GET(req: Request) {
  // Require admin authentication
  const adminCheck = await requireAdminServer();
  
  if (!adminCheck.ok) {
    return NextResponse.json(
      { 
        error: adminCheck.reason === 'unauthorized' ? 'Authentication required' : 'Admin access required',
        reason: adminCheck.reason 
      }, 
      { status: adminCheck.reason === 'unauthorized' ? 401 : 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId');
  
  if (!orgId) {
    return NextResponse.json({ error: 'orgId required' }, { status: 400 });
  }

  try {
    // Log admin action for audit trail
    await logAdminAction('roster_view', adminCheck.user, { orgId });
    
    const data = await fetchRoster(orgId);
    return NextResponse.json({ 
      data,
      _meta: {
        timestamp: new Date().toISOString(),
        admin_user: adminCheck.user.id,
        admin_role: adminCheck.role
      }
    });
  } catch (e: any) {
    console.error('Roster fetch error:', e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
