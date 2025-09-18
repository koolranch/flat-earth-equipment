import { unstable_noStore as noStore } from 'next/cache';
import { requireOrgRoleServer } from '@/lib/orgs/requireOrgRoleServer';
import { getCourseBySlug } from '@/lib/training/getCourseBySlug';
import { getSeatSummary } from '@/lib/orgs/seats';
import { supabaseServer } from '@/lib/supabase/server';
import CopyButton from '@/components/trainer/CopyButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function makeToken() {
  // Not cryptographically perfect, but fine for now; can swap to crypto later
  return (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)) + Math.random().toString(36).slice(2);
}

export default async function TrainerInvites() {
  noStore();
  const { orgId, userId, role } = await requireOrgRoleServer(['owner','trainer']);
  const course = await getCourseBySlug('forklift');
  const seats = await getSeatSummary(orgId, course.id);
  const supabase = supabaseServer();

  async function createInvite(formData: FormData) {
    'use server';
    const email = String(formData.get('email') || '').trim().toLowerCase();
    if (!email) return;
    const token = makeToken();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14); // 14 days
    const { data: inv, error } = await supabase
      .from('invitations')
      .insert({ org_id: orgId, email, role: 'learner', token, invited_by: userId, expires_at: expires.toISOString() })
      .select('token')
      .maybeSingle();
    if (error) throw error;
    // Nothing returned (server action), the page will re-render and show it via a list fetch below
  }

  const { data: invites } = await supabase
    .from('invitations')
    .select('email, role, token, expires_at, accepted_at, created_at')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  return (
    <div className="mx-auto max-w-2xl py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Trainer · Invites</h1>
        <p className="text-sm text-muted-foreground">Role: {role} · Org: <code>{orgId}</code></p>
      </div>

      <section className="rounded-2xl p-4 border grid gap-2">
        <div className="text-sm">Seats available for <strong>Forklift</strong>: {seats.available} / {seats.total}</div>
        {seats.available === 0 && (
          <div className="text-xs text-red-600">No seats available. Purchase seats or free one up before inviting.</div>
        )}
        <form action={createInvite} className="mt-2 flex gap-2">
          <input name="email" type="email" required placeholder="learner@email" className="flex-1 rounded border px-3 py-2" />
          <button type="submit" className="btn-primary" disabled={seats.available === 0}>Invite</button>
        </form>
      </section>

      <section className="rounded-2xl p-4 border">
        <h2 className="text-lg font-medium">Pending & recent invites</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(invites || []).map((i) => {
            const url = baseUrl ? `${baseUrl}/redeem?token=${encodeURIComponent(i.token)}` : `/redeem?token=${encodeURIComponent(i.token)}`;
            return (
              <li key={i.token} className="flex flex-col gap-1 border p-2 rounded">
                <div className="flex items-center justify-between">
                  <span>{i.email} · {i.role}</span>
                  <span className="text-muted-foreground">{i.accepted_at ? 'Accepted' : 'Pending'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <code className="flex-1 break-all">{url}</code>
                  <CopyButton text={url} data-testid="copy-invite" />
                </div>
                <div className="text-xs text-muted-foreground">Expires: {new Date(i.expires_at).toLocaleString()}</div>
              </li>
            );
          })}
          {(!invites || invites.length === 0) && <li className="text-muted-foreground">No invites yet.</li>}
        </ul>
      </section>

      <div className="text-xs text-muted-foreground">Email sending can be added later; for now copy the invite link above.</div>
    </div>
  );
}
