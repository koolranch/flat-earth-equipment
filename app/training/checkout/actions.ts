// Training checkout actions
'use server'

import { redirect } from 'next/navigation';
import { getTrainingPlanByPriceId, TRAINING_PLANS } from '@/lib/training/plans';
import { supabaseServer } from '@/lib/supabase/server';

export async function createCheckoutSession(planId: string) {
  return {
    success: true,
    checkoutUrl: '/training/checkout/success',
  };
}

export async function createTrainingCheckoutSessionFromForm(formData: FormData): Promise<void> {
  const priceId = formData.get('priceId') as string;
  const referralCode = formData.get('referralCode') as string | null;
  
  if (!priceId) {
    throw new Error('Missing priceId');
  }

  const plan = getTrainingPlanByPriceId(priceId);
  if (!plan) {
    throw new Error('Unknown or unconfigured training plan');
  }
  
  // Create Stripe checkout session via API
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.flatearthequipment.com';

  // [feature-flag: ENABLE_ASK_EMPLOYER_CHECKOUT]
  // When on, forward request_id and prefill_email from the form (populated via hidden
  // inputs by PricingStrip's RequestParamsHiddenInputs component) to the checkout API.
  // When off (or the fields are absent), the extra keys are omitted and behavior is
  // byte-identical to the legacy flow.
  const askEmployerExtras: Record<string, string> = {};
  if (process.env.ENABLE_ASK_EMPLOYER_CHECKOUT === '1') {
    const requestId = formData.get('requestId') as string | null;
    const prefillEmail = formData.get('prefillEmail') as string | null;
    if (requestId) askEmployerExtras.request_id = requestId;
    if (prefillEmail) askEmployerExtras.prefill_email = prefillEmail;
  }

  // Google Ads click ids (injected by ClickIdsHiddenInput) → forwarded to the
  // checkout API so they land in the Stripe Checkout Session metadata. This lets
  // us attribute Stripe sales back to ad clicks (true ROAS).
  const clickIds: Record<string, string> = {};
  for (const key of ['gclid', 'gbraid', 'wbraid'] as const) {
    const value = formData.get(key);
    if (typeof value === 'string' && value.trim()) {
      clickIds[key] = value.trim();
    }
  }

  const response = await fetch(`${baseUrl}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{
        priceId: priceId,
        quantity: 1,  // Always 1 - buying one package
        isTraining: true,
        metadata: {
          seat_count: plan.seats,  // Pass seat count in metadata
          checkout_mode: plan.checkoutMode,
          is_unlimited: plan.id === 'unlimited',
          plan_id: plan.id,
          billing_label: plan.billingLabel || '',
        }
      }],
      ...(referralCode && { referral_code: referralCode }),
      ...askEmployerExtras,
      ...(Object.keys(clickIds).length > 0 && { click_ids: clickIds }),
    })
  });
  
  const data = await response.json();
  
  if (data.url) {
    // Redirect to Stripe Checkout
    redirect(data.url);
  } else {
    throw new Error(data.error || 'Failed to create checkout session');
  }
}

/**
 * [exam-unlock] Checkout for enrolled-but-unpaid users hitting the gated exam
 * (see lib/training/exam-entitlement-gate.server.ts). Single-seat $49 plan.
 * Reads the AUTHED user's email server-side and locks the Stripe checkout to it,
 * so webhook fulfillment attaches the order to their existing account instead of
 * creating an orphan account under a different email.
 */
export async function createExamUnlockCheckout(): Promise<void> {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user?.email) {
    redirect('/login?next=' + encodeURIComponent('/training/exam'));
  }

  const plan = TRAINING_PLANS.single;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.flatearthequipment.com';

  const response = await fetch(`${baseUrl}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{
        priceId: plan.priceId,
        quantity: 1,
        isTraining: true,
        metadata: {
          seat_count: plan.seats,
          checkout_mode: plan.checkoutMode,
          is_unlimited: false,
          plan_id: plan.id,
          billing_label: '',
          entry_point: 'exam_unlock',
        }
      }],
      prefill_source: 'exam_unlock',
      prefill_email: user!.email,
    })
  });

  const data = await response.json();
  if (data.url) {
    redirect(data.url);
  } else {
    throw new Error(data.error || 'Failed to create checkout session');
  }
}

export async function processPayment(paymentData: any) {
  return {
    success: true,
    transactionId: 'stub-transaction',
  };
}
