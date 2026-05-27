/**
 * GET /api/training/exam/status
 *
 * Mobile source of truth for exam purchase + certificate state.
 * Supports cookie auth (web) and Bearer auth (Expo mobile).
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/mobile-auth';
import { supabaseService } from '@/lib/supabase/service.server';
import { getExamStatusForUser } from '@/lib/training/exam-access.server';

export async function GET(req: NextRequest) {
  const { user } = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const status = await getExamStatusForUser(supabaseService(), user.id);
    return NextResponse.json(status);
  } catch (error) {
    console.error('[training/exam/status] error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
