'use client';

import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface BuyNowButtonProps {
  priceId: string;
  slug: string;
  priceCents: number;
}

export default function BuyNowButton({ priceId, slug, priceCents }: BuyNowButtonProps) {
  const router = useRouter();

  async function handleBuyNow() {
    const stripe = await stripePromise;
    const res = await fetch('/api/checkout/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId,
        slug,
      }),
    });
    const { url, error } = await res.json();
    if (error) {
      console.error('Checkout error:', error);
    } else {
      window.location.assign(url);
    }
  }

  return (
    <button
      onClick={handleBuyNow}
      className="mt-6 bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition-colors"
    >
      Buy Now — ${(priceCents / 100).toFixed(2)}
    </button>
  );
} 