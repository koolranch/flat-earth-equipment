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
    console.log('👉 handleBuyNow called', {
      priceId,
      slug,
    });
    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          slug,
        }),
      });
      console.log('📦 fetch response status:', response.status);
      const data = await response.json();
      console.log('📨 fetch response body:', data);
      if (data.error) {
        console.error('Stripe session error:', data.error);
      } else if (data.url) {
        console.log('🔗 redirecting to:', data.url);
        window.location.assign(data.url);
      } else {
        console.warn('Unexpected response:', data);
      }
    } catch (err) {
      console.error('‼️ handleBuyNow exception:', err);
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