'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with error handling
let stripePromise: Promise<any> | null = null;
const getStripe = () => {
  if (!stripePromise) {
    const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    console.log('🔑 Stripe initialization:', {
      keyExists: !!stripeKey,
      keyLength: stripeKey?.length,
      keyPrefix: stripeKey?.substring(0, 7),
      envKeys: Object.keys(process.env).filter(key => key.includes('STRIPE')),
      key: stripeKey // Log the full key for debugging
    });
    
    if (!stripeKey) {
      console.error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
      return null;
    }
    try {
      stripePromise = loadStripe(stripeKey);
      console.log('✅ Stripe promise created');
    } catch (error) {
      console.error('❌ Error creating Stripe promise:', error);
      return null;
    }
  }
  return stripePromise;
};

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
    stripe_product_id?: string;
    stripe_price_id?: string;
    has_core_charge?: boolean;
    core_charge?: number;
  };
  variants: Variant[];
}

export default function ProductDetails({ part, variants }: ProductDetailsProps) {
  console.log('🎯 ProductDetails mounted with:', {
    part: {
      id: part.id,
      name: part.name,
      stripe_product_id: part.stripe_product_id,
      stripe_price_id: part.stripe_price_id
    },
    variantsCount: variants?.length,
    variants: variants?.map(v => ({
      id: v.id,
      firmware_version: v.firmware_version,
      price: v.price,
      stripe_price_id: v.stripe_price_id
    }))
  });

  const [selected, setSelected] = useState<Variant | null>(variants?.[0] || null);
  const [isLoading, setIsLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 Selected variant changed:', selected);
  }, [selected]);

  useEffect(() => {
    // Check Stripe initialization on component mount
    const checkStripe = async () => {
      try {
        console.log('🔍 Checking Stripe initialization...');
        const stripe = await getStripe();
        if (!stripe) {
          console.error('❌ Stripe initialization failed');
          setStripeError('Stripe is not properly configured. Please contact support.');
        } else {
          console.log('✅ Stripe initialized successfully');
        }
      } catch (error) {
        console.error('❌ Stripe initialization error:', error);
        setStripeError('Failed to initialize payment system. Please try again later.');
      }
    };
    checkStripe();
  }, []);

  const handleCheckout = async () => {
    // Use variant's stripe_price_id if available, otherwise use product's stripe_price_id
    const priceId = selected?.stripe_price_id || part.stripe_price_id;
    console.log('🔍 Checkout details:', {
      hasVariants: variants.length > 0,
      selectedVariant: selected ? {
        id: selected.id,
        firmware_version: selected.firmware_version,
        price: selected.price,
        stripe_price_id: selected.stripe_price_id
      } : null,
      productPriceId: part.stripe_price_id,
      finalPriceId: priceId
    });

    if (!priceId) {
      console.error('No price ID available:', { selected, part });
      return;
    }

    if (stripeError) {
      alert(stripeError);
      return;
    }

    setIsLoading(true);

    try {
      // 1) Load Stripe.js
      console.log('🔄 Loading Stripe.js...');
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe.js failed to load. Please contact support.');
      }
      console.log('✅ Stripe.js loaded successfully');

      // 2) Call checkout API
      console.log('🚀 Starting checkout with:', {
        priceId,
        coreCharge: selected?.core_charge || (part.has_core_charge ? part.core_charge : undefined),
        variant: selected ? {
          id: selected.id,
          firmware_version: selected.firmware_version,
          price: selected.price,
          has_core_charge: selected.has_core_charge,
          core_charge: selected.core_charge
        } : undefined
      });

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          coreCharge: selected?.core_charge || (part.has_core_charge ? part.core_charge : undefined)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('❌ Checkout API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          requestBody: {
            priceId,
            coreCharge: selected?.core_charge || (part.has_core_charge ? part.core_charge : undefined)
          }
        });
        throw new Error(errorData?.error || `Checkout API returned ${response.status}`);
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
      console.log('🔄 Redirecting to Stripe checkout...', { sessionId });
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        console.error('❌ Stripe redirect error:', error);
        throw error;
      }
    } catch (error) {
      console.error('❌ Checkout error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred during checkout. Please try again.');
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
              disabled={!selected?.stripe_price_id && !part.stripe_price_id || isLoading || !!stripeError}
              className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150 ${
                (isLoading || !!stripeError) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Processing...' : stripeError ? 'Payment System Unavailable' : `Buy & Ship Today — $${selected?.price?.toFixed(2) || part.price.toFixed(2)}${
                (selected?.has_core_charge && selected.core_charge) || (part.has_core_charge && part.core_charge) ? ` + $${(selected?.core_charge || part.core_charge)?.toFixed(2)} core fee` : ''
              }`}
            </button>
            {stripeError && (
              <p className="mt-2 text-sm text-red-600">{stripeError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 