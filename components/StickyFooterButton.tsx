'use client';

import { useRouter } from 'next/navigation';

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
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          slug,
        }),
      });
      const data = await response.json();
      if (data.error) {
        console.error('Stripe session error:', data.error);
      } else if (data.url) {
        window.location.assign(data.url);
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