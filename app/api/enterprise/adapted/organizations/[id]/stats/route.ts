// Adapted Enterprise Organization Stats API
import { NextRequest, NextResponse } from 'next/server';
import { getAdaptedOrganizationStats } from '@/lib/enterprise/adapted-database.server';
import { createServerClient } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

// GET /api/enterprise/adapted/organizations/[id]/stats
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
      
      // If user is a manager, only show their team's stats
      if (membership?.role === 'manager') {
        managerId = user.id;
      }
      // Admins and owners see org-wide stats (managerId stays undefined)
    }

    const stats = await getAdaptedOrganizationStats(params.id, managerId);
    
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