// app/api/admin/orgs/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createOrg } from '@/lib/admin/orgs.server';

const Body = z.object({ name: z.string().min(2) });
export async function POST(req: Request) {
  try {
    const data = Body.parse(await req.json());
    const id = await createOrg(data.name);
    return NextResponse.json({ id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
