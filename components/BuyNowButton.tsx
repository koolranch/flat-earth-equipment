'use client';

import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Product {
  id: string;
  name: string;
  stripe_price_id: string;
  price_cents: number;
  has_core_charge?: boolean;
  core_charge?: number;
}

interface BuyNowButtonProps {
  product: Product;
  slug: string;
}

export default function BuyNowButton({ product, slug }: BuyNowButtonProps) {
  const router = useRouter();

  async function handleBuyNow() {
    console.log('👉 handleBuyNow called', {
      product,
      slug,
    });
    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
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

  // Calculate total price including core charge if applicable
  const totalPrice = product.has_core_charge && product.core_charge
    ? product.price_cents + (product.core_charge * 100)
    : product.price_cents;

  return (
    <button
      onClick={handleBuyNow}
      className="mt-6 bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition-colors w-full"
    >
      Buy Now & Ship Today — ${(product.price_cents / 100).toFixed(2)} + ${product.core_charge?.toFixed(2) || '0'} core fee
    </button>
  );
} 