import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { extractLegacyProgressPayload, updateProgressForModule } from '@/lib/training/progress-write';

export async function POST(req: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const p = extractLegacyProgressPayload(body);

  const res = await updateProgressForModule({
    userId: user.id,
    courseIdOrSlug: p.courseIdOrSlug,
    moduleSlug: p.moduleSlug || null,
    moduleId: p.moduleId || null,
    gate: (p.complete ? null : (p.gate ?? null)) as any,
    complete: p.complete || !p.gate  // legacy complete-module often means full complete
  });

  if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: res.status || 400 });
  return NextResponse.json({ ok: true, progress_pct: res.progress_pct, resume_state: res.resume_state });
}
