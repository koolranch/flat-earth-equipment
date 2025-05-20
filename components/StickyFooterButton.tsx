'use client';

import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StickyFooterButtonProps {
  product: {
    id: string;
    name: string;
    stripe_price_id: string;
    price_cents: number;
    has_core_charge?: boolean;
    core_charge?: number;
  };
  slug: string;
}

export default function StickyFooterButton({ product, slug }: StickyFooterButtonProps) {
  const router = useRouter();

  async function handleBuyNow() {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: product.stripe_price_id,
          coreCharge: product.has_core_charge ? product.core_charge : undefined
        }),
      });
      const data = await response.json();
      if (data.error) {
        console.error('Stripe session error:', data.error);
      } else if (data.sessionId) {
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Stripe failed to initialize');
        }
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (error) {
          console.error('Stripe redirect error:', error);
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  }

  return (
    <button
      onClick={handleBuyNow}
      className="inline-block px-4 py-2 bg-white text-canyon-rust rounded hover:bg-gray-100 transition"
    >
      Buy Now & Ship Today
    </button>
  );
} 