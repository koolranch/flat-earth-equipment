// app/api/admin/invitations/accept/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { acceptInvitation } from '@/lib/admin/orgs.server';

const Body = z.object({ token: z.string().min(8) });
export async function POST(req: Request) {
  try {
    const { token } = Body.parse(await req.json());
    const ok = await acceptInvitation(token);
    return NextResponse.json({ ok });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
