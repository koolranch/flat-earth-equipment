import { supabaseServer } from '@/lib/supabase/server';

export async function getSeatSummary(orgId: string, courseId: string) {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('org_seats')
    .select('total_seats, allocated_seats')
    .eq('org_id', orgId)
    .eq('course_id', courseId)
    .maybeSingle();
  const total = data?.total_seats ?? 0;
  const used = data?.allocated_seats ?? 0;
  return { total, used, available: Math.max(0, total - used) };
}
