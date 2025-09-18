import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Redeem({ searchParams }: { searchParams: { token?: string } }) {
  noStore();
  const token = (searchParams?.token || '').trim();
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/redeem?token=${encodeURIComponent(token)}`)}`);

  // Use admin client to bypass RLS for the multi-step redeem
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // 1) Load invitation
  const { data: inv, error: invErr } = await admin
    .from('invitations')
    .select('org_id, email, role, token, expires_at, accepted_at, invited_by')
    .eq('token', token)
    .maybeSingle();
  if (invErr || !inv) return <div className="p-6">Invalid or missing invitation.</div>;
  if (inv.accepted_at) return <div className="p-6">This invitation has already been used.</div>;
  if (new Date(inv.expires_at).getTime() < Date.now()) return <div className="p-6">This invitation has expired.</div>;

  // 2) Find forklift course id
  const { data: course } = await admin.from('courses').select('id, slug').eq('slug', 'forklift').maybeSingle();
  if (!course) return <div className="p-6">Course not found.</div>;

  // 3) Ensure seat availability (if no org_seats row, treat as 0 available)
  const { data: seats } = await admin
    .from('org_seats')
    .select('total_seats, allocated_seats')
    .eq('org_id', inv.org_id)
    .eq('course_id', course.id)
    .maybeSingle();
  const total = seats?.total_seats ?? 0;
  const used = seats?.allocated_seats ?? 0;
  if (total - used <= 0) return <div className="p-6">No seats available. Please contact your trainer.</div>;

  // 4) Claim seat (best-effort optimistic update)
  const { data: seatUpd, error: seatErr } = await admin
    .from('org_seats')
    .update({ allocated_seats: used + 1 })
    .eq('org_id', inv.org_id)
    .eq('course_id', course.id)
    .lte('allocated_seats', used) // prevent simple races
    .select('allocated_seats')
    .maybeSingle();
  if (seatErr || !seatUpd) return <div className="p-6">Seat claim failed. Try again or contact trainer.</div>;

  // 5) Add org membership (learner) if missing
  await admin.from('org_members')
    .upsert({ org_id: inv.org_id, user_id: user.id, role: 'learner' }, { onConflict: 'org_id,user_id' });

  // 6) Enroll user in course (idempotent)
  await admin.from('enrollments')
    .upsert({ user_id: user.id, course_id: course.id, progress_pct: 0, passed: false, org_id: inv.org_id }, { onConflict: 'user_id,course_id' });

  // 7) Mark invitation accepted
  await admin.from('invitations').update({ accepted_at: new Date().toISOString() }).eq('token', token);

  redirect('/training');
}
