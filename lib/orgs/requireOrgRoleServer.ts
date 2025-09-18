import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';

export async function requireOrgRoleServer(allowedRoles: string[] = ['owner','trainer']) {
  noStore();
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent('/trainer')}`);

  // Find a membership where user has one of the allowed roles
  const { data: membership, error } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .in('role', allowedRoles)
    .maybeSingle();

  if (error || !membership) redirect('/'); // No access → bounce (adjust target as you prefer)
  return { userId: user.id, orgId: membership.org_id, role: membership.role };
}
