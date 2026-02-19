// Training checkout actions
'use server'

import { redirect } from 'next/navigation';

// Map Stripe Price IDs to seat counts for proper order tracking
const PRICE_TO_SEATS: Record<string, number> = {
  'price_1SToXBHJI548rO8JZnnTwKER': 1,   // Single Operator (Black Friday $49)
  'price_1RS835HJI548rO8JkMXj7FMQ': 5,   // 5-Pack
  'price_1RS835HJI548rO8JbvRrMwUv': 25,  // 25-Pack
  'price_1RS836HJI548rO8JwlCAzg7m': 999, // Facility Unlimited
};

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
  
  // Get seat count for this price ID (defaults to 1 for unknown prices)
  const seatCount = PRICE_TO_SEATS[priceId] || 1;
  
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
          seat_count: seatCount  // Pass seat count in metadata
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
