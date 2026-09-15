import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { runTrialInviteNudge } from '@/lib/training/trialInviteNudge.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Weekday cron: one invite nudge to GFC employer trials that are 2–10 days
 * old and still have zero seat invites / claims. FEE /safety and GFC $49
 * solos are out of the query by construction (source_brand + subscription).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runTrialInviteNudge(supabaseService());
    if ('error' in result && result.error) {
      return NextResponse.json(result, { status: 500 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('trial-invite-nudge cron failed', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
