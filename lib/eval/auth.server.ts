import 'server-only';

import { supabaseService } from '@/lib/supabase/service.server';

const PROFILE_EVAL_ROLES = new Set(['trainer', 'admin']);
const ORG_EVAL_ROLES = new Set(['owner', 'trainer', 'admin', 'manager']);

export async function canManageEvaluations(userId: string): Promise<boolean> {
  const svc = supabaseService();

  const [{ data: profile }, { data: memberships }] = await Promise.all([
    svc.from('profiles').select('role').eq('id', userId).maybeSingle(),
    svc.from('org_members').select('role').eq('user_id', userId),
  ]);

  const profileRole =
    typeof profile?.role === 'string' ? profile.role.toLowerCase() : '';
  if (PROFILE_EVAL_ROLES.has(profileRole)) {
    return true;
  }

  return (memberships || []).some((membership) => {
    const role =
      typeof membership?.role === 'string' ? membership.role.toLowerCase() : '';
    return ORG_EVAL_ROLES.has(role);
  });
}
