// app/api/admin/assign-seat/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase/server';

const Body = z.object({ orgId: z.string().uuid(), userId: z.string().uuid(), courseId: z.string().uuid(), learnerEmail: z.string().email().optional() });
export async function POST(req: Request) {
  try {
    const { orgId, userId, courseId, learnerEmail } = Body.parse(await req.json());
    const sb = supabaseServer();
    // Upsert enrollment for this user/course, attach org
    const { data: existing } = await sb
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await sb.from('enrollments').update({ org_id: orgId, learner_email: learnerEmail ?? null }).eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await sb.from('enrollments').insert({ user_id: userId, course_id: courseId, org_id: orgId, learner_email: learnerEmail ?? null, passed: false, progress_pct: 0 });
      if (error) throw error;
    }

    // Audit
    await sb.from('audit_events').insert({ org_id: orgId, action: 'seat.assign', target: userId, meta: { courseId } });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
