import 'server-only';

import { supabaseService } from '@/lib/supabase/service.server';

export async function getLatestEnrollmentForUser(userId: string) {
  const svc = supabaseService();
  const { data } = await svc
    .from('enrollments')
    .select('id, course_id, passed')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ?? null;
}
