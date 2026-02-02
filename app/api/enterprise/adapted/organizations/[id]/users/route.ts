// Adapted Enterprise Organization Users API
import { NextRequest, NextResponse } from 'next/server';
import { getOrganizationUsers } from '@/lib/enterprise/adapted-database.server';
import { createServerClient } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

// GET /api/enterprise/adapted/organizations/[id]/users
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50');
    const search = url.searchParams.get('search') || undefined;
    const status = url.searchParams.get('status') as 'all' | 'active' | 'completed' || 'all';

    // Get current user to check if they're a manager
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let managerId: string | undefined;
    
    if (user) {
      // Check user's role in this org
      const svc = supabaseService();
      const { data: membership } = await svc
        .from('org_members')
        .select('role')
        .eq('org_id', params.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      // If user is a manager, only show their team members
      if (membership?.role === 'manager') {
        managerId = user.id;
      }
      // Admins and owners see all users (managerId stays undefined)
    }

    const result = await getOrganizationUsers(params.id, {
      page,
      pageSize,
      search,
      status,
      managerId
    });

    return NextResponse.json({
      ok: true,
      users: result.users,
      total: result.total,
      page,
      pageSize,
      totalPages: Math.ceil(result.total / pageSize)
    });

  } catch (error) {
    console.error('Organization users API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to load organization users' },
      { status: 500 }
    );
  }
}