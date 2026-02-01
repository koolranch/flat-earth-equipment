// Enterprise Roster Export API - CSV Download
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getOrganizationUsers } from '@/lib/enterprise/adapted-database.server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get org_id from query params
    const url = new URL(request.url);
    const orgId = url.searchParams.get('org_id');
    
    if (!orgId) {
      return NextResponse.json({ ok: false, error: 'org_id is required' }, { status: 400 });
    }

    // Verify user has access to this org (check org_members)
    const { data: membership } = await supabase
      .from('org_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('org_id', orgId)
      .maybeSingle();

    // Allow owners, admins, managers, and trainers to export
    const allowedRoles = ['owner', 'admin', 'manager', 'trainer'];
    if (!membership || !allowedRoles.includes(membership.role?.toLowerCase() || '')) {
      return NextResponse.json({ ok: false, error: 'Access denied' }, { status: 403 });
    }

    // Fetch all users (up to 1000 for export)
    const { users, total } = await getOrganizationUsers(orgId, {
      page: 1,
      pageSize: 1000
    });

    // Generate CSV content
    const headers = [
      'Email',
      'Name', 
      'Course',
      'Progress (%)',
      'Online Status',
      'Enrollment Date',
      'Last Activity'
    ];

    const rows = users.map(user => [
      user.email || '',
      user.full_name || '',
      user.course || '',
      user.progress_pct?.toString() || '0',
      user.status === 'completed' ? 'Completed' : 'In Progress',
      user.enrollment_date ? new Date(user.enrollment_date).toLocaleDateString() : '',
      user.last_activity ? new Date(user.last_activity).toLocaleDateString() : ''
    ]);

    // Build CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Return as downloadable CSV file
    const filename = `team-roster-${new Date().toISOString().slice(0, 10)}.csv`;
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Roster export error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to export roster' },
      { status: 500 }
    );
  }
}
