// Adapted Enterprise Organization Users API
import { NextRequest, NextResponse } from 'next/server';
import { getOrganizationUsers } from '@/lib/enterprise/adapted-database';

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

    const result = await getOrganizationUsers(params.id, {
      page,
      pageSize,
      search,
      status
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