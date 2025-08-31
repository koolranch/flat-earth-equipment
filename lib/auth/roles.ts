import { supabaseServer } from '@/lib/supabase/server';

export type Role = 'learner' | 'trainer' | 'admin';

export async function getUserAndRole() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { user: null, role: null as Role | null };
  const { data: prof } = await sb.from('profiles').select('id, email, full_name, role').eq('id', user.id).maybeSingle();
  return { user, role: (prof?.role as Role) || 'learner' };
}

export function isTrainerOrAdmin(role: Role | null) {
  return role === 'trainer' || role === 'admin';
}
