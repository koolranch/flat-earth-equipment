'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { getDisplayBrand, sanitizeCustomerFacingCopy } from '@/lib/parts/displayBrand';
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
    compatible_models?: string[] | null;
    weight_lbs?: number | null;
    metadata?: Record<string, unknown> | null;
  };
  variants: Variant[];
}

export default function ProductDetails({ part, variants }: ProductDetailsProps) {
  const [selected, setSelected] = useState<Variant | null>(variants?.[0] || null);
  const isRubberTrack = part.category === 'Rubber Tracks';
  // Tracks are almost always replaced in pairs — default to a full set of 2.
  const [quantity, setQuantity] = useState(isRubberTrack ? 2 : 1);
  const { addItem } = useCart();
  const router = useRouter();

  const partMetadata = (part.metadata as Record<string, unknown> | null) ?? {};
  const serialPrefixes = Array.isArray(partMetadata.serial_prefixes)
    ? (partMetadata.serial_prefixes as string[])
    : [];
  const warrantyMonths =
    typeof partMetadata.warranty_months === 'number' ? partMetadata.warranty_months : null;

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
      quantity,
      // Pass weight_lbs through metadata for shipping calculators (e.g., HazMat lithium freight)
      metadata: {
        ...(part.weight_lbs ? { weight_lbs: part.weight_lbs } : {}),
        ...(partMetadata.freight_cents != null
          ? { freight_cents: partMetadata.freight_cents }
          : {}),
        ...(partMetadata.free_freight ? { free_freight: true } : {}),
      },
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
          <p className="text-gray-600 mb-4">{getDisplayBrand(part.brand)}</p>
          {part.description && (
            <div className="text-gray-700 mb-6 whitespace-pre-line">
              {sanitizeCustomerFacingCopy(part.description)}
            </div>
          )}
          <div className="text-2xl font-bold mb-4">
            ${selected?.price?.toFixed(2) || part.price.toFixed(2)}
            {(selected?.has_core_charge && selected.core_charge) || (part.has_core_charge && part.core_charge) 
              ? ` + $${(selected?.core_charge || part.core_charge)?.toFixed(2)} core fee` 
              : ''}
            {isRubberTrack && <span className="text-base font-medium text-gray-500"> / track</span>}
          </div>

          {isRubberTrack && (
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-800 text-sm font-semibold px-3 py-1.5 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
                Free Shipping
              </span>
              {warrantyMonths && (
                <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold px-3 py-1.5 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {warrantyMonths / 12}-Year Warranty
                </span>
              )}
            </div>
          )}

          {isRubberTrack && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(1)}
                  className={`flex-1 border-2 rounded-lg px-4 py-3 text-left transition-colors ${
                    quantity === 1
                      ? 'border-canyon-rust bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-slate-900">Single Track</div>
                  <div className="text-sm text-gray-600">${part.price.toFixed(2)}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setQuantity(2)}
                  className={`flex-1 border-2 rounded-lg px-4 py-3 text-left transition-colors ${
                    quantity === 2
                      ? 'border-canyon-rust bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-slate-900">Pair (Both Sides)</div>
                  <div className="text-sm text-gray-600">${(part.price * 2).toFixed(2)}</div>
                </button>
              </div>
              {quantity === 2 && (
                <p className="text-xs text-gray-500 mt-2">
                  Recommended — running a new track opposite a worn one shortens the life of both.
                </p>
              )}
            </div>
          )}

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
              Add to Cart — ${((selected?.price ?? part.price) * quantity).toFixed(2)}${
                (selected?.has_core_charge && selected.core_charge) || (part.has_core_charge && part.core_charge) 
                  ? ` + $${(selected?.core_charge || part.core_charge)?.toFixed(2)} core fee` 
                  : ''
              }
            </button>
          </div>

          {/* Fitment verification - Only for rubber tracks */}
          {isRubberTrack && serialPrefixes.length > 0 && (
            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-6">
              <h3 className="font-bold text-lg text-slate-900 mb-2">Verify Your Fitment</h3>
              <p className="text-sm text-slate-600 mb-3">
                This track fits {getDisplayBrand(part.brand)}{' '}
                {part.compatible_models?.join(', ')} machines with serial numbers beginning:
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {serialPrefixes.map((prefix) => (
                  <span
                    key={prefix}
                    className="bg-white border border-slate-300 text-slate-800 font-mono text-sm px-3 py-1 rounded"
                  >
                    {prefix}
                  </span>
                ))}
              </div>
              <p className="text-sm text-slate-600">
                Not sure where your serial plate is?{' '}
                <Link
                  href={`/${part.brand.toLowerCase()}-serial-number-lookup`}
                  className="text-canyon-rust font-semibold underline hover:text-orange-700"
                >
                  Use our {getDisplayBrand(part.brand)} serial number lookup
                </Link>{' '}
                to find it, then match the first four characters.
              </p>
            </div>
          )}

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

      {/* Compatibility Section */}
      {part.compatible_models && part.compatible_models.length > 0 && (
        <section className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Compatible with {part.compatible_models.length}+ {part.brand} Models
              </h2>
              <p className="text-sm text-slate-600">Verified fitment for industrial equipment</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Telehandlers */}
            {part.compatible_models.some(m => m.startsWith('5')) && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Loadall Telehandlers
                </h3>
                <div className="flex flex-wrap gap-2">
                  {part.compatible_models
                    .filter(m => m.startsWith('5'))
                    .map(model => (
                      <span key={model} className="bg-white border border-green-100 text-slate-700 text-xs px-2 py-1 rounded">
                        {model}
                      </span >
                    ))}
                </div>
              </div>
            )}

            {/* Wheeled Loaders */}
            {part.compatible_models.some(m => m.startsWith('4')) && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Wheeled Loaders
                </h3>
                <div className="flex flex-wrap gap-2">
                  {part.compatible_models
                    .filter(m => m.startsWith('4'))
                    .map(model => (
                      <span key={model} className="bg-white border border-green-100 text-slate-700 text-xs px-2 py-1 rounded">
                        {model}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-green-100 flex items-center justify-between">
            <p className="text-sm text-green-800">
              Not sure about your model? Check your serial number.
            </p>
            <Link
              href={`/brand/${part.brand.toLowerCase()}/serial-lookup`}
              className="text-sm font-semibold text-green-700 hover:text-green-900 underline flex items-center gap-1"
            >
              Open Serial Lookup →
            </Link>
          </div>
        </section>
      )}

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