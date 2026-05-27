/**
 * GET /api/training/exam/questions
 *
 * Returns the mobile final exam question bank (without correct answers).
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/mobile-auth';
import { getShuffledMobileExamQuestions } from '@/lib/training/mobile-exam-bank';

export async function GET(req: NextRequest) {
  const { user } = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ questions: getShuffledMobileExamQuestions() });
}
