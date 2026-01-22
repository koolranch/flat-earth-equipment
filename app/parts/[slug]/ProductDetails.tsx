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
    category?: string;
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
      category: part.category,
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
            <div className="text-gray-700 mb-6 whitespace-pre-line">{part.description}</div>
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

          {/* Fork Finder Link - Only for fork products */}
          {part.category?.includes('Fork') && (
            <div className="mt-6 bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-slate-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-slate-900 text-white p-3 rounded-lg flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900 mb-1">
                    Need Different Specs?
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">
                    Use our Fork Finder to filter by class, length, and width. Find your perfect fit in 30 seconds.
                  </p>
                  <Link 
                    href="/forks"
                    className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-canyon-rust transition-colors font-medium text-sm"
                  >
                    Open Fork Finder →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Corporate Buyer CTA - Only for fork products */}
          {part.category?.includes('Fork') && (
            <div className="mt-6 bg-slate-900 text-white border-2 border-slate-700 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-canyon-rust p-3 rounded-lg flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">
                    Corporate Buyer?
                  </h3>
                  <p className="text-sm text-slate-300 mb-3">
                    Fleet pricing, NET-30 terms, and dedicated account management for orders of 10+ forks.
                    <strong className="text-white">FREE FREIGHT on orders of 15+ forks!</strong>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link 
                      href="/quote?type=bulk&product=forks" 
                      className="inline-flex items-center px-4 py-2 bg-canyon-rust text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
                    >
                      Request Volume Quote →
                    </Link>
                    <a 
                      href="tel:+1-888-392-9175" 
                      className="inline-flex items-center px-4 py-2 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors font-medium text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Call (888) 392-9175
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
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
          ⚠️  Operators untrained?  <Link href="/safety" className="underline font-medium">
            Get certified online&nbsp;now
          </Link>.
        </p>
      </footer>
    </div>
  );
} 