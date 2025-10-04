// Training checkout actions
'use server'

import { redirect } from 'next/navigation';

export async function createCheckoutSession(planId: string) {
  return {
    success: true,
    checkoutUrl: '/training/checkout/success',
  };
}

export async function createTrainingCheckoutSessionFromForm(formData: FormData): Promise<void> {
  const priceId = formData.get('priceId') as string;
  
  if (!priceId) {
    throw new Error('Missing priceId');
  }
  
  // Create Stripe checkout session via API
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flatearthequipment.com';
  
  const response = await fetch(`${baseUrl}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{
        priceId: priceId,
        quantity: 1,
        isTraining: true
      }]
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
