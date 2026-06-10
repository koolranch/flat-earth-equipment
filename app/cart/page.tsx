'use client';

import { useCart } from '@/hooks/useCart';
import Image from 'next/image';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { useState, useEffect } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const [locale, setLocale] = useState<'en' | 'es'>('en');

  useEffect(() => {
    // Get locale from cookie on client side
    const cookieLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('lang='))
      ?.split('=')[1] as 'en' | 'es';
    setLocale(cookieLocale || 'en');
  }, []);
  
  // Translation strings
  const t = {
    en: {
      cartEmpty: 'Your Cart is Empty',
      cartEmptyDesc: 'Add some items to your cart to get started.',
      browseParts: 'Browse Parts',
      shoppingCart: 'Shopping Cart',
      coreCharge: 'Core Charge:',
      remove: 'Remove',
      clearCart: 'Clear Cart',
      orderSummary: 'Order Summary',
      subtotal: 'Subtotal',
      coreCharges: 'Core Charges',
      total: 'Total',
      proceedToCheckout: 'Proceed to Checkout'
    },
    es: {
      cartEmpty: 'Su Carrito Está Vacío',
      cartEmptyDesc: 'Agregue algunos artículos a su carrito para comenzar.',
      browseParts: 'Explorar Partes',
      shoppingCart: 'Carrito de Compras',
      coreCharge: 'Cargo de Núcleo:',
      remove: 'Eliminar',
      clearCart: 'Vaciar Carrito',
      orderSummary: 'Resumen del Pedido',
      subtotal: 'Subtotal',
      coreCharges: 'Cargos de Núcleo',
      total: 'Total',
      proceedToCheckout: 'Proceder al Pago'
    }
  }[locale]

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            priceId: item.stripe_price_id,
            quantity: item.quantity,
            coreCharge: item.has_core_charge ? item.core_charge : undefined,
            metadata: item.metadata,
            name: item.name,
            category: item.category,
            price: item.price
          }))
        }),
      });

      const data = await response.json();
      
      console.log('📊 Checkout API response:', {
        status: response.status,
        data: data
      });
      
      if (data.error) {
        console.error('Stripe session error:', data.error);
        alert(`Checkout failed: ${data.error}`);
      } else if (data.sessionId) {
        console.log('✅ Session ID received:', data.sessionId);
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Stripe failed to initialize');
        }
        console.log('🔄 Redirecting to Stripe checkout...');
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (error) {
          console.error('Stripe redirect error:', error);
          alert(`Redirect failed: ${error.message}`);
        }
      } else {
        console.error('❌ Unexpected response:', data);
        alert('Unexpected checkout response');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert(`Checkout error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const coreCharges = items.reduce((sum, item) => 
    sum + ((item.has_core_charge && item.core_charge) ? item.core_charge * item.quantity : 0), 0);
  
  // Estimate freight (checkout API is authoritative)
  const freightCharges = (() => {
    let freight = 0;
    for (const item of items) {
      const fc = Number(item.metadata?.freight_cents);
      if (Number.isFinite(fc) && fc > 0) {
        freight += (fc / 100) * Math.max(1, item.quantity);
        continue;
      }
    }
    const categories = items
      .filter((item) => !(Number(item.metadata?.freight_cents) > 0))
      .map((item) => item.category)
      .filter(Boolean);
    const hasForks = categories.some(
      (cat) =>
        cat === 'forks' ||
        cat === 'Class II Forks' ||
        cat === 'Class III Forks' ||
        cat === 'Class IV Forks'
    );
    if (hasForks) freight += 395;
    if (categories.includes('Rug / Carpet Rams')) freight += 1000;
    const mitsubishiItems = items.filter(
      (item) =>
        !(Number(item.metadata?.freight_cents) > 0) &&
        (item.category === 'Mitsubishi Parts' ||
          (item.category?.startsWith('Mitsubishi ') ?? false))
    );
    for (const item of mitsubishiItems) {
      const p = item.price;
      if (p < 25) freight += 18;
      else if (p < 150) freight += 25;
      else if (p < 300) freight += 31;
      else if (p < 500) freight += 37;
      else if (p < 650) freight += 41;
      else freight += 50;
    }
    // Lithium battery HazMat freight estimate — mirrors the authoritative
    // tiers in /api/checkout (Class 9 ground, free on 3+ batteries).
    const lithiumItems = items.filter(
      (item) =>
        !(Number(item.metadata?.freight_cents) > 0) &&
        item.category === 'Lithium Batteries'
    );
    const lithiumQty = lithiumItems.reduce((sum, item) => sum + Math.max(1, item.quantity), 0);
    if (lithiumQty > 0 && lithiumQty < 3) {
      for (const item of lithiumItems) {
        const weight = Number(item.metadata?.weight_lbs ?? 100);
        let perUnit = 349;
        if (weight < 50) perUnit = 99;
        else if (weight < 100) perUnit = 149;
        else if (weight < 150) perUnit = 199;
        else if (weight < 200) perUnit = 279;
        freight += perUnit * Math.max(1, item.quantity);
      }
    }
    return freight;
  })();


  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">{t.cartEmpty}</h1>
        <p className="text-gray-600 mb-8">{t.cartEmptyDesc}</p>
        <Link
          href="/parts"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition-colors"
        >
          {t.browseParts}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">{t.shoppingCart}</h1>
      
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
                    {t.coreCharge} ${item.core_charge.toFixed(2)}
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
                {t.remove}
              </button>
            </div>
          ))}

          <div className="mt-4">
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-800"
            >
              {t.clearCart}
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">{t.orderSummary}</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>{t.subtotal}</span>
                <span>${total.toFixed(2)}</span>
              </div>
              {coreCharges > 0 && (
                <div className="flex justify-between">
                  <span>{t.coreCharges}</span>
                  <span>${coreCharges.toFixed(2)}</span>
                </div>
              )}
              {freightCharges > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>Freight Shipping</span>
                  <span>${freightCharges.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>{t.total}</span>
                <span>${(total + coreCharges + freightCharges).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition-colors"
            >
              {t.proceedToCheckout}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 