import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(){
  return NextResponse.json({
    ok: true,
    source: (process.env.USE_GREEN_VIEW ?? '1') === '1' ? 'green_chargers' : 'parts',
    enabled: (process.env.RECS_ENABLED ?? '1') === '1',
    ampTolerancePct: Number(process.env.RECS_AMP_TOLERANCE_PCT ?? '15')
  });
}