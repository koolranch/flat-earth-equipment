'use client';

import { useCart } from '@/hooks/useCart';

interface Product {
  id: string;
  name: string;
  stripe_price_id: string;
  price_cents: number;
  has_core_charge?: boolean;
  core_charge?: number;
  image_url?: string;
}

interface BuyNowButtonProps {
  product: Product;
  slug: string;
}

export default function BuyNowButton({ product, slug }: BuyNowButtonProps) {
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
      quantity: 1
    });
  };

  // Calculate total price including core charge if applicable
  const totalPrice = product.has_core_charge && product.core_charge
    ? product.price_cents + (product.core_charge * 100)
    : product.price_cents;

  return (
    <button
      onClick={handleAddToCart}
      className="mt-6 bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition-colors w-full"
    >
      Add to Cart — ${(product.price_cents / 100).toFixed(2)} + ${product.core_charge?.toFixed(2) || '0'} core fee
    </button>
  );
} 