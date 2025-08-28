// app/api/admin/invitations/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createInvitation } from '@/lib/admin/orgs.server';

const Body = z.object({ orgId: z.string().uuid(), email: z.string().email(), role: z.enum(['owner','trainer','learner']).optional() });
export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());
    const { token } = await createInvitation(body.orgId, body.email, (body.role as any) || 'learner');
    // Return a link (email sending can be added later)
    return NextResponse.json({ token }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
