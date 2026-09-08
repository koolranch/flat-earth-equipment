import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { sendTrainingReminderEmail, sendManagerExpirationDigest } from '@/lib/email/resend';
import type { SourceBrand } from '@/lib/training/sourceBrand';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Daily expiration-reminder cron (schedule in vercel.json).
 *
 * Finds operators whose passed certification expires within 90 days (or lapsed
 * in the last 30), emails each a brand-aware renewal reminder once per
 * threshold bucket, and sends each manager a single digest of who was reminded.
 * Dedup is tracked in trainer_reminders as auto_renewal_<bucket>.
 *
 * Who is in scope:
 *  - Managed operators (unreleased seat claim under a trainer's order), any brand.
 *  - GFC solo buyers: the $49 getforkliftcertified.com/certification purchase
 *    (their own order with source_brand='gfc', no seat claim). They get a
 *    self-serve renewal email pointing back at /certification; no manager digest.
 *  - FEE solo buyers (flatearthequipment.com/safety, source_brand null) remain
 *    intentionally out of scope — unchanged behaviour.
 *
 * NOTE: this replaces the previous implementation, which called a
 * get_renewals_due RPC that never existed in the database and therefore
 * silently sent nothing.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

// Bucket boundaries in days-until-expiry: first match wins.
function bucketFor(daysLeft: number): string | null {
  if (daysLeft <= -30 || daysLeft > 90) return null;
  if (daysLeft <= 0) return 'expired';
  if (daysLeft <= 7) return '7';
  if (daysLeft <= 30) return '30';
  if (daysLeft <= 60) return '60';
  return '90';
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const svc = supabaseService();
    const now = Date.now();
    const windowStart = new Date(now - 30 * DAY_MS).toISOString();
    const windowEnd = new Date(now + 90 * DAY_MS).toISOString();

    const { data: enrollments, error: enrollError } = await svc
      .from('enrollments')
      .select('id, user_id, course_id, expires_at')
      .eq('passed', true)
      .not('expires_at', 'is', null)
      .gte('expires_at', windowStart)
      .lte('expires_at', windowEnd);
    if (enrollError) {
      console.error('renewals cron: enrollment query failed', enrollError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    if (!enrollments?.length) {
      return NextResponse.json({ sent: 0, message: 'No renewals due' });
    }

    const learnerIds = Array.from(new Set(enrollments.map(e => e.user_id)));

    // Managed operators only: map learner -> seat claim -> order -> manager.
    // Released claims are departed operators — their ex-employer shouldn't
    // trigger renewal reminders for them.
    const { data: claims } = await svc
      .from('seat_claims')
      .select('user_id, order_id, created_at')
      .in('user_id', learnerIds)
      .is('released_at', null)
      .order('created_at', { ascending: false });
    const claimByLearner: Record<string, { order_id: string }> = {};
    for (const c of claims || []) {
      if (!claimByLearner[c.user_id]) claimByLearner[c.user_id] = { order_id: c.order_id };
    }

    const orderIds = Array.from(new Set(Object.values(claimByLearner).map(c => c.order_id)));
    const { data: orders } = orderIds.length
      ? await svc.from('orders').select('id, user_id, source_brand').in('id', orderIds)
      : { data: [] as Array<{ id: string; user_id: string; source_brand: string | null }> };
    const orderById: Record<string, { user_id: string; source_brand: string | null }> = Object.fromEntries(
      (orders || []).map(o => [o.id, { user_id: o.user_id, source_brand: o.source_brand }])
    );

    // GFC solo buyers: learners with no seat claim who own a single-seat,
    // one-time GFC-origin order (the $49 /certification purchase). Subscription
    // orders are excluded so a Crew manager who also trained isn't told to renew
    // for $49. FEE solo buyers (source_brand null) are deliberately not matched.
    const unclaimedLearnerIds = learnerIds.filter(id => !claimByLearner[id]);
    const gfcSoloLearners = new Set<string>();
    if (unclaimedLearnerIds.length) {
      const { data: soloOrders } = await svc
        .from('orders')
        .select('user_id')
        .in('user_id', unclaimedLearnerIds)
        .eq('source_brand', 'gfc')
        .eq('seats', 1)
        .is('stripe_subscription_id', null);
      for (const o of soloOrders || []) gfcSoloLearners.add(o.user_id);
    }

    if (!orderIds.length && !gfcSoloLearners.size) {
      return NextResponse.json({ sent: 0, message: 'No managed operators or GFC solo buyers due' });
    }

    const enrollmentIds = enrollments.map(e => e.id);
    const { data: priorReminders } = await svc
      .from('trainer_reminders')
      .select('enrollment_id, reminder_type')
      .in('enrollment_id', enrollmentIds)
      .like('reminder_type', 'auto_renewal_%');
    const alreadySent = new Set((priorReminders || []).map(r => `${r.enrollment_id}:${r.reminder_type}`));

    const profileIds = Array.from(new Set([
      ...learnerIds,
      ...Object.values(orderById).map(o => o.user_id),
    ]));
    const { data: profiles } = await svc
      .from('profiles')
      .select('id, full_name, email')
      .in('id', profileIds);
    const profileById: Record<string, { full_name: string | null; email: string | null }> = Object.fromEntries(
      (profiles || []).map(p => [p.id, { full_name: p.full_name, email: p.email }])
    );

    const courseIds = Array.from(new Set(enrollments.map(e => e.course_id).filter(Boolean)));
    const { data: courses } = await svc.from('courses').select('id, title').in('id', courseIds);
    const courseTitleById: Record<string, string> = Object.fromEntries((courses || []).map(c => [c.id, c.title]));

    type DigestEntry = { name: string; email: string; expiresAt: string; daysLeft: number };
    const digests: Record<string, { brand: SourceBrand; operators: DigestEntry[] }> = {};
    const results: Array<{ enrollment_id: string; email: string; bucket: string; solo?: boolean; success: boolean }> = [];

    for (const e of enrollments) {
      const daysLeft = Math.ceil((new Date(e.expires_at).getTime() - now) / DAY_MS);
      const bucket = bucketFor(daysLeft);
      if (!bucket) continue;

      const reminderType = `auto_renewal_${bucket}`;
      if (alreadySent.has(`${e.id}:${reminderType}`)) continue;

      const claim = claimByLearner[e.user_id];
      const isGfcSolo = !claim && gfcSoloLearners.has(e.user_id);
      if (!claim && !isGfcSolo) continue; // FEE solo buyer — out of scope
      const order = claim ? orderById[claim.order_id] : null;
      if (claim && !order) continue;

      const learner = profileById[e.user_id];
      if (!learner?.email) continue;

      const brand = (isGfcSolo || order?.source_brand === 'gfc' ? 'gfc' : null) as SourceBrand;
      const courseTitle = courseTitleById[e.course_id] || 'Forklift Operator Training';
      const firstName = (learner.full_name || '').trim().split(/\s+/)[0] || undefined;

      try {
        await sendTrainingReminderEmail({
          to: learner.email,
          name: firstName,
          courseTitle,
          reminderType: 'renewal',
          expiresAt: e.expires_at,
          brand,
          solo: isGfcSolo,
        });
        // Solo buyers have no manager; attribute the dedupe row to the learner.
        await svc.from('trainer_reminders').insert({
          enrollment_id: e.id,
          sent_by: order ? order.user_id : e.user_id,
          reminder_type: reminderType,
        });
        results.push({ enrollment_id: e.id, email: learner.email, bucket, solo: isGfcSolo || undefined, success: true });

        if (!order) continue; // no manager digest for solo buyers

        const managerId = order.user_id;
        if (!digests[managerId]) digests[managerId] = { brand, operators: [] };
        digests[managerId].operators.push({
          name: learner.full_name || learner.email,
          email: learner.email,
          expiresAt: e.expires_at,
          daysLeft,
        });
      } catch (err) {
        console.error(`renewals cron: failed for enrollment ${e.id}`, err);
        results.push({ enrollment_id: e.id, email: learner.email, bucket, success: false });
      }
    }

    let digestsSent = 0;
    for (const [managerId, digest] of Object.entries(digests)) {
      const manager = profileById[managerId];
      if (!manager?.email || !digest.operators.length) continue;
      try {
        await sendManagerExpirationDigest({
          to: manager.email,
          managerName: (manager.full_name || '').trim().split(/\s+/)[0] || undefined,
          operators: digest.operators,
          brand: digest.brand,
        });
        digestsSent++;
      } catch (err) {
        console.error(`renewals cron: manager digest failed for ${managerId}`, err);
      }
    }

    const sent = results.filter(r => r.success).length;
    return NextResponse.json({ sent, digestsSent, total: results.length, results });
  } catch (error) {
    console.error('renewals cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
