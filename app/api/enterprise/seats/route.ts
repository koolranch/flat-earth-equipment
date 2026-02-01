// Enterprise Seat Management API
// Get seat availability for an organization

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org_id');
    const courseId = searchParams.get('course_id'); // Optional - filter by course

    if (!orgId) {
      return NextResponse.json({ ok: false, error: 'org_id is required' }, { status: 400 });
    }

    // Verify user has access to this org
    const { data: membership } = await supabase
      .from('org_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('org_id', orgId)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ ok: false, error: 'Not a member of this organization' }, { status: 403 });
    }

    const svc = supabaseService();

    // Build query for seat data
    let query = svc
      .from('org_seats')
      .select(`
        id,
        course_id,
        total_seats,
        allocated_seats,
        courses(id, title, slug)
      `)
      .eq('org_id', orgId);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data: seats, error } = await query;

    if (error) {
      console.error('Failed to fetch seats:', error);
      return NextResponse.json({ ok: false, error: 'Failed to fetch seat data' }, { status: 500 });
    }

    // Transform and calculate available seats
    const seatSummary = (seats || []).map(seat => ({
      course_id: seat.course_id,
      course_title: (seat.courses as any)?.title || 'Unknown Course',
      course_slug: (seat.courses as any)?.slug,
      total: seat.total_seats,
      used: seat.allocated_seats,
      available: Math.max(0, seat.total_seats - seat.allocated_seats)
    }));

    // Calculate totals across all courses
    const totals = seatSummary.reduce((acc, s) => ({
      total: acc.total + s.total,
      used: acc.used + s.used,
      available: acc.available + s.available
    }), { total: 0, used: 0, available: 0 });

    return NextResponse.json({
      ok: true,
      org_id: orgId,
      seats: seatSummary,
      totals,
      has_seat_tracking: seatSummary.length > 0
    });

  } catch (error) {
    console.error('Seats API error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch seats' }, { status: 500 });
  }
}
