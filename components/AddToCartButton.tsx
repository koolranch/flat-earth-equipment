'use client';

import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ReactNode, useState } from 'react';

interface AddToCartButtonProps {
  sku: string; // Stripe Price ID
  qty: number;
  price?: number; // Price in cents
  meta?: {
    firmwareVersion?: string;
    moduleId?: string;
    offer?: string;
    [key: string]: any;
  };
  className?: string;
  children: ReactNode;
}

function AddToCartToCartLegacy({ 
  sku, 
  qty, 
  price = 0,
  meta, 
  className = "", 
  children 
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const router = useRouter();

  const handleAddToCart = () => {
    // Create a unique ID that includes metadata for cart identification
    const itemId = meta?.moduleId ? `${meta.moduleId}-${meta.offer || 'default'}` : sku;
    
    // Create display name that includes offer type
    const displayName = meta?.offer 
      ? `Charger Module (${meta.offer})`
      : 'Charger Module';

    addItem({
      id: itemId,
      name: displayName,
      price: price / 100, // Convert cents to dollars for display
      stripe_price_id: sku,
      quantity: qty,
      metadata: meta, // Store metadata for checkout
    });
    
    // Show success toast
    toast.success('Added to cart!', {
      duration: 2000,
      position: 'bottom-right',
      style: {
        background: '#059669',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
      },
    });
    
    // Redirect to cart page after a short delay
    setTimeout(() => {
      router.push('/cart');
    }, 1000);
  };

  return (
    <button
      onClick={handleAddToCart}
      className={className}
    >
      {children}
    </button>
  );
} 

export default function AddToCartButton({
  priceId,
  slug,
  quantity = 1,
}: {
  priceId?: string | null;
  slug: string;
  quantity?: number;
}) {
  const [loading, setLoading] = useState(false);
  const disabled = !priceId || priceId.trim() === "";

  async function buyNow() {
    if (disabled || loading) return;
    try {
      setLoading(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, slug, qty: quantity }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { url } = await res.json();
      if (url) window.location.href = url;
      else throw new Error("No checkout URL");
    } catch (err) {
      console.error(err);
      alert("Sorry, checkout couldn’t start. Please try again or request a quote.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={buyNow}
      disabled={disabled || loading}
      className={`rounded-xl px-3 py-2 text-sm font-semibold text-white ${disabled ? "bg-neutral-300 cursor-not-allowed" : "bg-black hover:bg-neutral-800"}`}
      title={disabled ? "Pricing not online yet—request a quote." : "Buy now"}
    >
      {loading ? "Redirecting…" : "Add to Cart"}
    </button>
  );
}