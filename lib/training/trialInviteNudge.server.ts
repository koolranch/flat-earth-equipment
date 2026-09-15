import { sendMail } from '@/lib/email/mailer';
import {
  generateGfcTrialInviteNudgeEmail,
  GFC_EMAIL_FROM,
} from '@/lib/email/gfcTrainerWelcome';

type OrdersClient = { from: (table: string) => any };

export const NUDGE_AFTER_MS = 2 * 24 * 60 * 60 * 1000;
export const NUDGE_UNTIL_MS = 10 * 24 * 60 * 60 * 1000;

export type NudgeOrder = {
  id: string;
  user_id: string;
  source_brand: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  seats: number | null;
  is_unlimited?: boolean | null;
  created_at: string;
};

/**
 * GFC employer trials only. FEE /safety (null brand), GFC $49 solos
 * (no subscription, one seat), and paid/paused/canceled subs are out.
 */
export function isGfcEmployerTrialOrder(order: {
  source_brand: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  seats: number | null;
  is_unlimited?: boolean | null;
}): boolean {
  if (order.source_brand !== 'gfc') return false;
  if (!order.stripe_subscription_id) return false;
  if (order.subscription_status !== 'trialing') return false;
  return (order.seats ?? 0) > 1 || order.is_unlimited === true;
}

/** 48 hours after signup, and before the Stripe trial-ending notice (~day 11). */
export function isInInviteNudgeWindow(createdAt: Date, now: Date): boolean {
  const age = now.getTime() - createdAt.getTime();
  return age >= NUDGE_AFTER_MS && age < NUDGE_UNTIL_MS;
}

export function trainerHasStartedInvites(
  order: { id: string; user_id: string },
  invites: Array<{ order_id: string | null; created_by: string }>,
  claims: Array<{ order_id: string }>,
): boolean {
  if (claims.some((claim) => claim.order_id === order.id)) return true;
  return invites.some(
    (invite) =>
      invite.order_id === order.id ||
      (invite.created_by === order.user_id && invite.order_id == null),
  );
}

function firstNameFrom(fullName: string | null | undefined): string {
  const first = (fullName || '').trim().split(/\s+/)[0];
  return first || 'there';
}

export async function runTrialInviteNudge(svc: OrdersClient, now = new Date()) {
  const windowStart = new Date(now.getTime() - NUDGE_UNTIL_MS).toISOString();
  const windowEnd = new Date(now.getTime() - NUDGE_AFTER_MS).toISOString();

  const { data: orders, error: orderError } = await svc
    .from('orders')
    .select(
      'id, user_id, source_brand, stripe_subscription_id, subscription_status, seats, is_unlimited, created_at',
    )
    .eq('source_brand', 'gfc')
    .eq('subscription_status', 'trialing')
    .not('stripe_subscription_id', 'is', null)
    .gte('created_at', windowStart)
    .lte('created_at', windowEnd);

  if (orderError) {
    console.error('trial-invite-nudge: order query failed', orderError);
    return { error: 'Database error', sent: 0, skipped: 0 };
  }

  const candidates = (orders || []).filter(
    (order: NudgeOrder) =>
      isGfcEmployerTrialOrder(order) &&
      isInInviteNudgeWindow(new Date(order.created_at), now),
  );
  if (!candidates.length) {
    return { sent: 0, skipped: 0, message: 'No empty GFC trials in the nudge window' };
  }

  const orderIds = candidates.map((order: NudgeOrder) => order.id);
  const userIds = Array.from(new Set(candidates.map((order: NudgeOrder) => order.user_id)));

  const [nudgesRes, invitesRes, claimsRes, profilesRes] = await Promise.all([
    svc.from('gfc_trial_invite_nudges').select('order_id').in('order_id', orderIds),
    svc
      .from('seat_invites')
      .select('order_id, created_by')
      .or(`order_id.in.(${orderIds.join(',')}),created_by.in.(${userIds.join(',')})`),
    svc.from('seat_claims').select('order_id').in('order_id', orderIds).is('released_at', null),
    svc.from('profiles').select('id, email, full_name').in('id', userIds),
  ]);
  if (nudgesRes.error || invitesRes.error || claimsRes.error || profilesRes.error) {
    console.error('trial-invite-nudge: lookup failed', {
      nudges: nudgesRes.error,
      invites: invitesRes.error,
      claims: claimsRes.error,
      profiles: profilesRes.error,
    });
    return { error: 'Database error', sent: 0, skipped: 0 };
  }
  const alreadySent = nudgesRes.data;
  const invites = invitesRes.data;
  const claims = claimsRes.data;
  const profiles = profilesRes.data;

  const sentIds = new Set((alreadySent || []).map((row: { order_id: string }) => row.order_id));
  const profileById = new Map(
    (profiles || []).map((profile: { id: string; email: string | null; full_name: string | null }) => [
      profile.id,
      profile,
    ]),
  );

  let sent = 0;
  let skipped = 0;

  for (const order of candidates) {
    if (sentIds.has(order.id)) {
      skipped += 1;
      continue;
    }
    if (trainerHasStartedInvites(order, invites || [], claims || [])) {
      skipped += 1;
      continue;
    }

    const profile = profileById.get(order.user_id);
    if (!profile?.email) {
      skipped += 1;
      continue;
    }

    const email = generateGfcTrialInviteNudgeEmail({
      firstName: firstNameFrom(profile.full_name),
    });
    const result = await sendMail({
      to: profile.email,
      from: GFC_EMAIL_FROM,
      subject: email.subject,
      html: email.html,
    });
    if (!result.ok) {
      console.error('trial-invite-nudge: send failed', { orderId: order.id, result });
      skipped += 1;
      continue;
    }

    const { error: insertError } = await svc.from('gfc_trial_invite_nudges').insert({
      order_id: order.id,
      email: profile.email,
      resend_id: result.id ?? null,
    });
    if (insertError) {
      console.error('trial-invite-nudge: dedupe insert failed', insertError);
    }
    sent += 1;
  }

  return { sent, skipped };
}
