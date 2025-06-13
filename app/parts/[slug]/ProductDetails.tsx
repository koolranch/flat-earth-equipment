'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';

interface Variant {
  id: string;
  firmware_version: string;
  price: number;
  stripe_price_id: string;
  has_core_charge?: boolean;
  core_charge?: number;
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
    stripe_price_id: string;
    has_core_charge?: boolean;
    core_charge?: number;
  };
  variants: Variant[];
}

export default function ProductDetails({ part, variants }: ProductDetailsProps) {
  const [selected, setSelected] = useState<Variant | null>(variants?.[0] || null);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    const item = selected || part;
    if (!item.stripe_price_id) {
      console.error('No stripe_price_id available for item:', item);
      return;
    }
    addItem({
      id: item.id,
      name: part.name + (selected ? ` (${selected.firmware_version})` : ''),
      price: item.price,
      stripe_price_id: item.stripe_price_id,
      has_core_charge: item.has_core_charge,
      core_charge: item.core_charge,
      image_url: part.image_url,
      quantity: 1
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {part.image_url && (
          <div className="relative aspect-square bg-white rounded-lg shadow-sm p-4">
            <img
              src={part.image_url}
              alt={part.name}
              className="object-contain w-full h-full"
            />
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{part.name}</h1>
            <p className="text-slate-600">{part.brand}</p>
          </div>

          {variants.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Select Version</h2>
              <div className="space-y-3">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelected(variant)}
                    className={`w-full text-left p-4 border rounded-lg transition-all ${
                      selected?.id === variant.id
                        ? 'border-canyon-rust bg-orange-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-900">Version {variant.firmware_version}</p>
                        <p className="text-sm text-slate-600">
                          ${variant.price.toFixed(2)}
                          {variant.has_core_charge && variant.core_charge && (
                            <span> + ${variant.core_charge.toFixed(2)} core fee</span>
                          )}
                        </p>
                      </div>
                      {selected?.id === variant.id && (
                        <span className="text-canyon-rust">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {part.description && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Description</h2>
              <p className="text-slate-700">{part.description}</p>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={handleAddToCart}
              className="w-full bg-canyon-rust hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150"
            >
              Add to Cart — ${selected?.price?.toFixed(2) || part.price.toFixed(2)}${
                (selected?.has_core_charge && selected.core_charge) || (part.has_core_charge && part.core_charge) 
                  ? ` + $${(selected?.core_charge || part.core_charge)?.toFixed(2)} core fee` 
                  : ''
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 