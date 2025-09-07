import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user');
  const course = searchParams.get('course') || 'forklift_operator';
  if (!userId) return NextResponse.json({ error: 'user_required' }, { status: 400 });
  const svc = supabaseService();
  // Adapt to your actual progress schema; fallback to allComplete=false if unknown
  const { data, error } = await svc.rpc('check_demo_completion', { p_user_id: userId, p_course: course });
  if (error) return NextResponse.json({ allComplete: false });
  return NextResponse.json({ allComplete: !!data });
}
