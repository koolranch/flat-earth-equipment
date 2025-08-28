export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { startAttempt } from '@/lib/quiz/attempts.server';

const Body = z.object({ 
  courseId: z.string().uuid().optional(), 
  moduleId: z.string().uuid().optional(), 
  poolIds: z.array(z.string()), 
  take: z.number().int().min(1), 
  mode: z.enum(['full','retry']).optional(), 
  retryIds: z.array(z.string()).optional() 
});

export async function POST(req: Request) {
  try { 
    const b = Body.parse(await req.json()); 
    const out = await startAttempt(b as any); 
    return NextResponse.json(out, { status: 201 }); 
  }
  catch(e: any) { 
    return NextResponse.json({ error: e.message }, { status: 400 }); 
  }
}
