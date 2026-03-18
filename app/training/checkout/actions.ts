// Training checkout actions
'use server'

import { redirect } from 'next/navigation';
import { getTrainingPlanByPriceId } from '@/lib/training/plans';

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
          plan_id: plan.id,
          billing_label: plan.billingLabel || '',
        }
      }],
      ...(referralCode && { referral_code: referralCode }),
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

export async function processPayment(paymentData: any) {
  return {
    success: true,
    transactionId: 'stub-transaction',
  };
}
