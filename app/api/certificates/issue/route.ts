import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export async function POST(req: Request) {
  try {
    const { user_id, course_slug='forklift_operator', exam_attempt_id, meta } = await req.json();
    const sb = supabaseServer();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const svc = supabaseService();
    const uid = user_id || user.id;
    const { data: cert, error } = await svc.from('certificates').insert({ user_id: uid, course_slug, exam_attempt_id }).select('*').single();
    if (error) throw error;

    // If you have a PDF generator endpoint, call it (best-effort)
    try { await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/certificates/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ certificate_id: cert.id, meta }) }); } catch {}

    return NextResponse.json({ certificate_id: cert.id }, { status: 201 });
  } catch (e) {
    console.error('cert issue', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
