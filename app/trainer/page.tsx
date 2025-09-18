import { unstable_noStore as noStore } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { requireOrgRoleServer } from '@/lib/orgs/requireOrgRoleServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TrainerHome() {
  noStore();
  const { orgId, role } = await requireOrgRoleServer(['owner','trainer']);
  const supabase = supabaseServer();

  // Try to load org (may or may not have a name column — handle gracefully)
  const { data: org } = await supabase
    .from('orgs')
    .select('id, name')
    .eq('id', orgId)
    .maybeSingle();

  // Members in this org (email comes from profiles; fall back if not joinable)
  const { data: members } = await supabase
    .from('org_members')
    .select('user_id, role')
    .eq('org_id', orgId);

  let emails: Record<string, string> = {};
  if (members && members.length) {
    const ids = members.map(m => m.user_id);
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', ids);
    for (const p of profs || []) emails[p.id] = p.email || '';
  }

  // Counts for invites and seats (RLS will enforce visibility)
  const [{ count: inviteCount }, { count: orgSeatCount }, { count: companySeatCount }] = await Promise.all([
    supabase.from('invitations').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
    supabase.from('org_seats').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
    supabase.from('company_seats').select('id', { count: 'exact', head: true })
  ]);

  return (
    <div className="mx-auto max-w-3xl py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Trainer Dashboard</h1>
        <p className="text-sm text-muted-foreground">Role: {role}</p>
      </div>

      <section className="rounded-2xl p-4 border">
        <h2 className="text-lg font-medium">Organization</h2>
        <div className="mt-2 text-sm">ID: <code>{org?.id || orgId}</code></div>
        {org?.name && <div className="text-sm">Name: {org.name}</div>}
      </section>

      <section className="rounded-2xl p-4 border">
        <h2 className="text-lg font-medium">Members</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {(members || []).map(m => (
            <li key={m.user_id} className="flex items-center justify-between">
              <span>{emails[m.user_id] || m.user_id}</span>
              <span className="text-muted-foreground">{m.role}</span>
            </li>
          ))}
          {(!members || members.length === 0) && <li className="text-muted-foreground">No members yet.</li>}
        </ul>
      </section>

      <section className="rounded-2xl p-4 border grid grid-cols-3 gap-4">
        <div>
          <div className="text-2xl font-semibold">{inviteCount ?? 0}</div>
          <div className="text-sm text-muted-foreground">Pending Invites</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{orgSeatCount ?? 0}</div>
          <div className="text-sm text-muted-foreground">Org Seats</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{companySeatCount ?? 0}</div>
          <div className="text-sm text-muted-foreground">Company Seats</div>
        </div>
      </section>

      <section className="rounded-2xl p-4 border">
        <h2 className="text-lg font-medium">Actions</h2>
        <div className="mt-3 flex gap-3">
          <a href="/trainer/invites" className="btn-primary">Manage Invites</a>
          <span className="text-sm text-muted-foreground">More tools coming soon</span>
        </div>
      </section>
    </div>
  );
}