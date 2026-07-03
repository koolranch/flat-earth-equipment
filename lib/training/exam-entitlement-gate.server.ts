import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { userHasExamPurchase } from '@/lib/training/exam-access.server';

/**
 * [feature-flag: ENABLE_EXAM_ENTITLEMENT_GATE]
 * Entitlement gate for the legacy web exam routes (/api/exam/*).
 *
 * Historically those routes only checked auth, because web users could not get
 * enrolled without paying first (the Stripe webhook creates enrollments). The
 * mobile app introduced trained-but-unpaid accounts, which could reach
 * /training/exam and certify without any purchase.
 *
 * Uses the SAME shared entitlement logic the mobile path runs in production
 * (`userHasExamPurchase`: direct orders, claimed employer seats, org-assigned
 * seat pools), so paid web buyers, app IAP buyers, and enterprise org members
 * (e.g. Knight Commercial) are unaffected.
 *
 * When the flag is off (or unset), this returns false and route behavior is
 * byte-identical to the pre-gate code. Rollback = unset the env + redeploy.
 */
export async function examEntitlementBlocked(
  svc: SupabaseClient,
  userId: string,
): Promise<boolean> {
  if (process.env.ENABLE_EXAM_ENTITLEMENT_GATE !== '1') return false;
  try {
    const { purchased } = await userHasExamPurchase(svc, userId);
    return !purchased;
  } catch (err) {
    // Fail open: an entitlement-lookup outage must not lock out paying users.
    console.error('[exam-entitlement-gate] lookup failed, allowing access:', err);
    return false;
  }
}

export const NOT_PURCHASED_RESPONSE = { ok: false, error: 'not_purchased' } as const;
