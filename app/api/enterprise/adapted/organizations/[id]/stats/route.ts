// Adapted Enterprise Organization Stats API
import { NextRequest, NextResponse } from 'next/server';
import { getAdaptedOrganizationStats } from '@/lib/enterprise/adapted-database.server';

// GET /api/enterprise/adapted/organizations/[id]/stats
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stats = await getAdaptedOrganizationStats(params.id);
    
    if (!stats) {
      return NextResponse.json(
        { ok: false, error: 'Organization not found or no data available' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      stats
    });

  } catch (error) {
    console.error('Organization stats API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to load organization statistics' },
      { status: 500 }
    );
  }
}