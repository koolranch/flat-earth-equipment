import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export async function POST(req: Request) {
  try {
    const { trainee_user_id, course_slug = 'forklift_operator' } = await req.json();
    const sb = supabaseServer();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    if (!trainee_user_id) return NextResponse.json({ error: 'trainee_user_id_required' }, { status: 400 });

    const svc = supabaseService();
    const { data, error } = await svc
      .from('practical_attempts')
      .insert({ course_slug, trainer_user_id: user.id, trainee_user_id, status: 'in_progress', started_at: new Date().toISOString() })
      .select('id')
      .single();
    if (error) throw error;
    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (e) {
    console.error('practical/start', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
