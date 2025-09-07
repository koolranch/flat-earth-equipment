import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user');
  const course = searchParams.get('course') || 'forklift_operator';
  if (!userId) return NextResponse.json({ error: 'user_required' }, { status: 400 });
  const svc = supabaseService();
  const { data, error } = await svc
    .from('practical_attempts')
    .select('*')
    .eq('trainee_user_id', userId)
    .eq('course_slug', course)
    .order('finished_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return NextResponse.json({ error: 'server_error' }, { status: 500 });
  return NextResponse.json({ passed: data?.status === 'passed', attempt: data || null });
}
