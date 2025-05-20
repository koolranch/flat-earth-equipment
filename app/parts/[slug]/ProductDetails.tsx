'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

interface Variant {
  id: string;
  firmware_version: string;
  price: number;
  has_core_charge?: boolean;
  core_charge?: number;
  stripe_price_id: string;
}

interface ProductDetailsProps {
  part: {
    id: string;
    name: string;
    brand: string;
    description?: string;
    image_url?: string;
    price: number;
    slug: string;
  };
  variants: Variant[];
}

export default function ProductDetails({ part, variants }: ProductDetailsProps) {
  const [selected, setSelected] = useState<Variant | null>(variants?.[0] || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!selected?.stripe_price_id) {
      console.error('No price ID available for selected variant');
      return;
    }

    setIsLoading(true);

    try {
      // 1) Load Stripe.js
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe.js failed to load');
      }

      // 2) Call checkout API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: selected.stripe_price_id,
          coreCharge: selected.core_charge
        }),
      });

      if (!response.ok) {
        throw new Error(`Checkout API returned ${response.status}`);
      }

      // 3) Parse response
      const payload = await response.json();
      console.log('🎟️ /api/checkout payload:', payload);

      // 4) Guard sessionId
      const sessionId = payload.sessionId;
      if (!sessionId) {
        throw new Error('No sessionId returned from checkout API');
      }

      // 5) Redirect to Stripe
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="aspect-w-16 aspect-h-9">
          {part.image_url ? (
            <img
              src={part.image_url}
              alt={part.name}
              className="object-cover w-full h-full rounded-lg"
            />
          ) : (
            <div className="bg-gray-200 rounded-lg w-full h-full flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{part.name}</h1>
          <p className="text-gray-600 mb-4">{part.brand}</p>
          
          {variants && variants.length > 0 && (
            <div className="mb-4">
              <label htmlFor="firmware" className="block text-sm font-medium text-gray-700 mb-1">
                Firmware Version:
              </label>
              <select
                id="firmware"
                value={selected?.id || ''}
                onChange={e => {
                  const v = variants.find(v => v.id === e.target.value);
                  if (v) setSelected(v);
                }}
                className="border rounded p-2 w-full"
              >
                {variants.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.firmware_version}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="mb-6">
            <p className="text-2xl font-semibold text-gray-900">
              ${selected?.price?.toFixed(2) || part.price.toFixed(2)}
              {selected?.has_core_charge && selected.core_charge && ` + $${selected.core_charge.toFixed(2)} core fee`}
            </p>
          </div>

          {part.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{part.description}</p>
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={handleCheckout}
              disabled={!selected?.stripe_price_id || isLoading}
              className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Processing...' : `Buy & Ship Today — $${selected?.price?.toFixed(2) || part.price.toFixed(2)}${
                selected?.has_core_charge && selected.core_charge ? ` + $${selected.core_charge.toFixed(2)} core fee` : ''
              }`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 