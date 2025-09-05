export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { finishAttempt } from '@/lib/quiz/attempts.server';
import { withSpan } from '@/lib/obs/withSpan';

const Body = z.object({ 
  attemptId: z.string().uuid(), 
  correctIds: z.array(z.string()) 
});

export async function POST(req: Request) {
  try { 
    const b = Body.parse(await req.json()); 
    const out = await withSpan('Quiz Answer', 'http.server', () => finishAttempt(b.attemptId, b.correctIds), { attempt_id: b.attemptId, correct_count: b.correctIds.length }); 
    return NextResponse.json(out); 
  }
  catch(e: any) { 
    return NextResponse.json({ error: e.message }, { status: 400 }); 
  }
}
