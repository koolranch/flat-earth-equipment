'use client';

import { useState } from 'react';

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
  };
  variants: Variant[];
}

export default function ProductDetails({ part, variants }: ProductDetailsProps) {
  const [selected, setSelected] = useState<Variant | null>(variants?.[0] || null);

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
              onClick={() => {
                if (!selected?.stripe_price_id) return;
                fetch('/api/checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    priceId: selected.stripe_price_id,
                    coreCharge: selected.has_core_charge ? selected.core_charge : undefined
                  })
                })
              }}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              disabled={!selected?.stripe_price_id}
            >
              Rent / Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 