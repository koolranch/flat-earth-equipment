'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

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
  const router = useRouter();

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
        <div>
          <h1 className="text-3xl font-bold mb-2">{part.name}</h1>
          <p className="text-gray-600 mb-4">{part.brand}</p>
          {part.description && (
            <p className="text-gray-700 mb-6">{part.description}</p>
          )}
          <div className="text-2xl font-bold mb-4">
            ${selected?.price?.toFixed(2) || part.price.toFixed(2)}
            {(selected?.has_core_charge && selected.core_charge) || (part.has_core_charge && part.core_charge) 
              ? ` + $${(selected?.core_charge || part.core_charge)?.toFixed(2)} core fee` 
              : ''}
          </div>

          {variants && variants.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Version
              </label>
              <select
                value={selected?.id || ''}
                onChange={(e) => {
                  const variant = variants.find(v => v.id === e.target.value);
                  setSelected(variant || null);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-canyon-rust focus:border-canyon-rust"
              >
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.firmware_version} - ${variant.price.toFixed(2)}
                    {variant.has_core_charge && variant.core_charge 
                      ? ` + $${variant.core_charge.toFixed(2)} core fee` 
                      : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={handleAddToCart}
              className="w-full bg-canyon-rust hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              Add to Cart — ${selected?.price?.toFixed(2) || part.price.toFixed(2)}${
                (selected?.has_core_charge && selected.core_charge) || (part.has_core_charge && part.core_charge) 
                  ? ` + $${(selected?.core_charge || part.core_charge)?.toFixed(2)} core fee` 
                  : ''
              }
            </button>
          </div>
        </div>
      </div>

      {/* Add internal linking for charger modules */}
      {(part.name.toLowerCase().includes('charger module') || part.name.toLowerCase().includes('enersys') || part.name.toLowerCase().includes('hawker')) && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Compare All Charger Module Options
          </h3>
          <p className="text-blue-800 mb-4">
            Looking for other charger modules? View our complete selection with interactive comparison and repair vs exchange options.
          </p>
          <Link 
            href="/charger-modules"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View All Charger Modules →
          </Link>
        </div>
      )}

      <footer className="mt-10 border-t pt-8">
        <p className="text-center text-sm text-gray-600">
          ⚠️  Operators untrained?  <Link href="/training" className="underline font-medium">
            Get certified online&nbsp;now
          </Link>.
        </p>
      </footer>
    </div>
  );
} 