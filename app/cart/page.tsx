'use client';

import { useCart } from '@/hooks/useCart';
import Image from 'next/image';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            priceId: item.stripe_price_id,
            quantity: item.quantity,
            coreCharge: item.has_core_charge ? item.core_charge : undefined
          }))
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
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const coreCharges = items.reduce((sum, item) => 
    sum + ((item.has_core_charge && item.core_charge) ? item.core_charge * item.quantity : 0), 0);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Add some items to your cart to get started.</p>
        <Link
          href="/parts"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition-colors"
        >
          Browse Parts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-4 border-b">
              {item.image_url && (
                <div className="relative w-24 h-24">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-600">${item.price.toFixed(2)}</p>
                {item.has_core_charge && item.core_charge && (
                  <p className="text-sm text-gray-500">
                    Core Charge: ${item.core_charge.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                  className="px-2 py-1 border rounded hover:bg-gray-100"
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-2 py-1 border rounded hover:bg-gray-100"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="mt-4">
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-800"
            >
              Clear Cart
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              {coreCharges > 0 && (
                <div className="flex justify-between">
                  <span>Core Charges</span>
                  <span>${coreCharges.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total</span>
                <span>${(total + coreCharges).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 