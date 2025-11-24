'use client';

import { useCart } from '@/hooks/useCart';

interface StickyFooterButtonProps {
  product: {
    id: string;
    name: string;
    stripe_price_id: string;
    price_cents: number;
    has_core_charge?: boolean;
    core_charge?: number;
    image_url?: string;
    category?: string;
  };
  slug: string;
}

export default function StickyFooterButton({ product, slug }: StickyFooterButtonProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price_cents / 100,
      stripe_price_id: product.stripe_price_id,
      has_core_charge: product.has_core_charge,
      core_charge: product.core_charge,
      image_url: product.image_url,
      category: product.category,
      quantity: 1
    });
  };

  return (
    <button
      onClick={handleAddToCart}
      className="inline-block px-4 py-2 bg-white text-canyon-rust rounded hover:bg-gray-100 transition"
    >
      Add to Cart
    </button>
  );
} 