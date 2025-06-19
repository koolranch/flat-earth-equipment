'use client';

import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ReactNode } from 'react';

interface AddToCartButtonProps {
  sku: string; // Stripe Price ID
  qty: number;
  meta?: {
    firmwareVersion?: string;
    moduleId?: string;
    offer?: string;
    [key: string]: any;
  };
  className?: string;
  children: ReactNode;
}

export default function AddToCartButton({ 
  sku, 
  qty, 
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
      price: 0, // Will be determined by Stripe price
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