import 'server-only';
import type Stripe from 'stripe';
import { Resend } from 'resend';
import { supabaseService } from '@/lib/supabase/service.server';
import { GFC_EMAIL_FROM } from '@/lib/email/gfcTrainerWelcome';
import {
  gfcCheckoutRecoveryFirstEmail,
  gfcCheckoutRecoverySecondEmail,
} from '@/lib/email/gfcCheckoutRecovery';
import { nextDaytimeSlot } from '@/lib/training/sendWindow';

/**
 * Abandoned-checkout recovery for GFC $49 operator sessions.
 *
 * Scope is deliberately narrow: a session qualifies only when it originated
 * from getforkliftcertified.com (item_0_utm_source), is a one-time training
 * purchase, and Stripe generated a recovery URL. FEE-hosted /safety purchases,
 * parts carts, and GFC employer trials (subscription mode) never match, so
 * nothing in this module can touch those flows.
 */

/**
 * Timing:
 *  - First email goes out immediately on expiry (about an hour after the
 *    abandon), whatever the clock says. The buyer was awake and shopping an
 *    hour ago; recovery odds decay fast and this is the email that recovers.
 *  - The follow-up targets ~24h later but is snapped into a daytime window
 *    (see sendWindow.ts) so a midnight abandon doesn't get its second nudge
 *    at midnight, buried under overnight spam.
 */
const FOLLOWUP_DELAY_MS = 23 * 60 * 60 * 1000; // ~24h after the 1h expiry
const DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;

export function isGfcOperatorCheckoutSession(session: Stripe.Checkout.Session): boolean {
  return (
    session.mode === 'payment' &&
    session.metadata?.item_0_utm_source === 'getforkliftcertified.com' &&
    session.metadata?.course_slug === 'forklift' &&
    session.metadata?.purchase_type !== 'extra_seats'
  );
}

function sessionEmail(session: Stripe.Checkout.Session): string | null {
  const email = session.customer_email || session.customer_details?.email || null;
  return email ? email.trim().toLowerCase() : null;
}

export type RecoveryOutcome =
  | { action: 'skipped'; reason: string }
  | { action: 'sent'; email: string; followupEmailId: string | null };

/**
 * `checkout.session.expired` handler. Sends the first recovery email now and
 * schedules the follow-up, recording both so a later purchase can cancel the
 * follow-up. Never throws — the webhook must always ack Stripe.
 */
export async function handleGfcOperatorSessionExpired(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<RecoveryOutcome> {
  if (!isGfcOperatorCheckoutSession(session)) {
    return { action: 'skipped', reason: 'not_gfc_operator_session' };
  }
  const email = sessionEmail(session);
  if (!email) return { action: 'skipped', reason: 'no_email' };
  const recoveryUrl = session.after_expiration?.recovery?.url ?? null;
  if (!recoveryUrl) return { action: 'skipped', reason: 'no_recovery_url' };

  const key = process.env.RESEND_API_KEY;
  if (!key) return { action: 'skipped', reason: 'no_resend_key' };

  try {
    // Already bought (another tab, a retry, or the recovery link itself)?
    const paid = await stripe.checkout.sessions.list({
      customer_details: { email },
      status: 'complete',
      limit: 5,
    });
    if (paid.data.some(s => s.payment_status === 'paid' && isGfcOperatorCheckoutSession(s))) {
      return { action: 'skipped', reason: 'already_purchased' };
    }

    // One recovery sequence per email per day — a buyer who opens three
    // sessions in ten minutes should get one email, not three.
    const supabase = supabaseService();
    const since = new Date(Date.now() - DEDUPE_WINDOW_MS).toISOString();
    const { data: recent } = await supabase
      .from('gfc_checkout_recovery')
      .select('id')
      .ilike('email', email)
      .gte('created_at', since)
      .limit(1);
    if (recent && recent.length > 0) {
      return { action: 'skipped', reason: 'recently_emailed' };
    }

    const resend = new Resend(key);
    const first = gfcCheckoutRecoveryFirstEmail({ recoveryUrl });
    const firstResult = await resend.emails.send({
      from: GFC_EMAIL_FROM,
      to: email,
      replyTo: 'support@getforkliftcertified.com',
      subject: first.subject,
      html: first.html,
      text: first.text,
      tags: [{ name: 'type', value: 'gfc_checkout_recovery_1' }],
    });
    if (firstResult.error) {
      console.error('[gfc-recovery] first email failed:', firstResult.error);
      return { action: 'skipped', reason: 'send_failed' };
    }

    const followupAt = nextDaytimeSlot(new Date(Date.now() + FOLLOWUP_DELAY_MS));
    const second = gfcCheckoutRecoverySecondEmail({ recoveryUrl });
    const secondResult = await resend.emails.send({
      from: GFC_EMAIL_FROM,
      to: email,
      replyTo: 'support@getforkliftcertified.com',
      subject: second.subject,
      html: second.html,
      text: second.text,
      scheduledAt: followupAt.toISOString(),
      tags: [{ name: 'type', value: 'gfc_checkout_recovery_2' }],
    });
    if (secondResult.error) {
      console.error('[gfc-recovery] follow-up schedule failed:', secondResult.error);
    }
    const followupEmailId = secondResult.data?.id ?? null;

    const { error: insertError } = await supabase.from('gfc_checkout_recovery').insert({
      checkout_session_id: session.id,
      email,
      first_email_id: firstResult.data?.id ?? null,
      followup_email_id: followupEmailId,
      followup_scheduled_for: followupEmailId ? followupAt.toISOString() : null,
    });
    if (insertError) {
      console.error('[gfc-recovery] failed to record recovery row:', insertError);
    }

    return { action: 'sent', email, followupEmailId };
  } catch (err) {
    console.error('[gfc-recovery] unexpected error:', err);
    return { action: 'skipped', reason: 'error' };
  }
}

/**
 * Called from `checkout.session.completed` for GFC operator purchases. Cancels
 * any scheduled follow-up for this email so a buyer never gets "still need
 * your certification?" after paying. Never throws.
 */
export async function cancelGfcRecoveryFollowups(email: string): Promise<number> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !email) return 0;
  try {
    const supabase = supabaseService();
    const { data: pending, error } = await supabase
      .from('gfc_checkout_recovery')
      .select('id, followup_email_id')
      .ilike('email', email.trim())
      .is('cancelled_at', null)
      .not('followup_email_id', 'is', null);
    if (error || !pending || pending.length === 0) return 0;

    const resend = new Resend(key);
    let cancelled = 0;
    for (const row of pending) {
      if (row.followup_email_id) {
        const result = await resend.emails.cancel(row.followup_email_id);
        if (result.error) {
          // Already sent or already cancelled — still mark the row so we stop retrying.
          console.warn('[gfc-recovery] cancel returned error (marking anyway):', result.error);
        }
      }
      await supabase
        .from('gfc_checkout_recovery')
        .update({ cancelled_at: new Date().toISOString() })
        .eq('id', row.id);
      cancelled += 1;
    }
    return cancelled;
  } catch (err) {
    console.error('[gfc-recovery] cancel error:', err);
    return 0;
  }
}
