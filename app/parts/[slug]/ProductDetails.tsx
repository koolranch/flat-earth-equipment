'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { getDisplayBrand, sanitizeCustomerFacingCopy } from '@/lib/parts/displayBrand';
import { getSerialLookupPath } from '@/lib/parts/serialLookupRoutes';
import {
  formatTrackLabel,
  getRubberTrackIntro,
  parseTrackSize,
  type RelatedTrack,
} from '@/lib/parts/rubberTrackUtils';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import RubberTrackVisual from '@/components/parts/RubberTrackVisual';
import SeatProductVisual from '@/components/parts/SeatProductVisual';
import { isSeatCategory } from '@/lib/parts/seatVisualUtils';

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
    category_slug?: string | null;
    compatible_models?: string[] | null;
    weight_lbs?: number | null;
    metadata?: Record<string, unknown> | null;
  };
  variants: Variant[];
  relatedTracks?: RelatedTrack[];
}

function TrackSpecTable({
  trackSize,
  treadPattern,
}: {
  trackSize: string;
  treadPattern: string;
}) {
  const specs = parseTrackSize(trackSize);
  if (!specs) return null;

  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <tbody>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="px-4 py-2 text-left font-medium text-slate-600">Size</th>
            <td className="px-4 py-2 font-semibold text-slate-900">
              {trackSize.replace(/x/gi, '×')}
            </td>
          </tr>
          <tr className="border-b border-slate-100">
            <th className="px-4 py-2 text-left font-medium text-slate-600">Width</th>
            <td className="px-4 py-2 text-slate-900">
              {specs.widthMm} mm ({specs.widthIn}&quot;)
            </td>
          </tr>
          <tr className="border-b border-slate-100">
            <th className="px-4 py-2 text-left font-medium text-slate-600">Pitch</th>
            <td className="px-4 py-2 text-slate-900">{specs.pitchMm} mm</td>
          </tr>
          <tr className="border-b border-slate-100">
            <th className="px-4 py-2 text-left font-medium text-slate-600">Links</th>
            <td className="px-4 py-2 text-slate-900">{specs.links}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left font-medium text-slate-600">Tread</th>
            <td className="px-4 py-2 capitalize text-slate-900">{treadPattern}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function ProductDetails({
  part,
  variants,
  relatedTracks = [],
}: ProductDetailsProps) {
  const [selected, setSelected] = useState<Variant | null>(variants?.[0] || null);
  const isRubberTrack = part.category === 'Rubber Tracks';
  const isSeatListing = isSeatCategory(part.category, part.category_slug);
  const [quantity, setQuantity] = useState(isRubberTrack ? 2 : 1);
  const { addItem } = useCart();

  const partMetadata = (part.metadata as Record<string, unknown> | null) ?? {};
  const serialPrefixes = Array.isArray(partMetadata.serial_prefixes)
    ? (partMetadata.serial_prefixes as string[])
    : [];
  const warrantyMonths =
    typeof partMetadata.warranty_months === 'number' ? partMetadata.warranty_months : null;
  const trackSize =
    typeof partMetadata.track_size === 'string' ? partMetadata.track_size : undefined;
  const treadPattern =
    typeof partMetadata.tread_pattern === 'string'
      ? partMetadata.tread_pattern
      : 'C pattern';

  const unitPrice = selected?.price ?? part.price;
  const lineTotal = unitPrice * quantity;
  const serialLookupPath = getSerialLookupPath(part.brand);
  const trackIntro = isRubberTrack ? getRubberTrackIntro(part.description) : '';

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
      metadata: {
        ...(part.weight_lbs ? { weight_lbs: part.weight_lbs } : {}),
        ...(partMetadata.freight_cents != null
          ? { freight_cents: partMetadata.freight_cents }
          : {}),
        ...(partMetadata.free_freight ? { free_freight: true } : {}),
      },
    });

    toast.success('Added to cart', {
      duration: 3500,
      position: 'bottom-right',
      style: {
        background: '#059669',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
      },
    });
  };

  const priceBlock = (
    <>
      <div className="text-2xl font-bold mb-1">
        ${unitPrice.toFixed(2)}
        {(selected?.has_core_charge && selected.core_charge) ||
        (part.has_core_charge && part.core_charge)
          ? ` + $${(selected?.core_charge || part.core_charge)?.toFixed(2)} core fee`
          : ''}
        {isRubberTrack && (
          <span className="text-base font-medium text-gray-500"> / track</span>
        )}
      </div>
      {isRubberTrack && (
        <p className="text-sm text-slate-600 mb-4">
          <span className="font-semibold text-slate-900">
            ${lineTotal.toFixed(2)} delivered
          </span>{' '}
          for {quantity === 2 ? 'a pair' : 'one track'} — free shipping and{' '}
          {warrantyMonths ? `${warrantyMonths / 12}-year warranty` : 'warranty'} included.
          Many sellers add $150+ freight at checkout.
        </p>
      )}
    </>
  );

  const trustBadges = isRubberTrack && (
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
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {warrantyMonths / 12}-Year Warranty
        </span>
      )}
    </div>
  );

  const quantitySelector = isRubberTrack && (
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
  );

  const variantSelector = variants && variants.length > 0 && (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Select Version</label>
      <select
        value={selected?.id || ''}
        onChange={(e) => {
          const variant = variants.find((v) => v.id === e.target.value);
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
  );

  const addToCartButton = (
    <button
      type="button"
      onClick={handleAddToCart}
      className="w-full bg-canyon-rust hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 min-h-[48px]"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
      </svg>
      Add to Cart — ${lineTotal.toFixed(2)}
      {(selected?.has_core_charge && selected.core_charge) ||
      (part.has_core_charge && part.core_charge)
        ? ` + $${(selected?.core_charge || part.core_charge)?.toFixed(2)} core fee`
        : ''}
    </button>
  );

  return (
    <div className={`max-w-7xl mx-auto px-4 py-16 ${isRubberTrack ? 'pb-32 md:pb-16' : ''}`}>
      {isRubberTrack ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <RubberTrackVisual
              name={part.name}
              imageUrl={part.image_url}
              trackSize={trackSize}
              treadPattern={treadPattern}
            />
            <div>
              <h1 className="text-3xl font-bold mb-2">{part.name}</h1>
              <p className="text-gray-600 mb-3">{getDisplayBrand(part.brand)}</p>
              {trackIntro && (
                <p className="text-gray-700 mb-5 leading-relaxed">{trackIntro}</p>
              )}
              {priceBlock}
              {trustBadges}
              {trackSize && (
                <TrackSpecTable trackSize={trackSize} treadPattern={treadPattern} />
              )}
              {quantitySelector}
              {variantSelector}
              <div className="pt-1">{addToCartButton}</div>
            </div>
          </div>

          {serialPrefixes.length > 0 && (
            <div className="mt-10 bg-slate-50 border border-slate-200 rounded-xl p-6">
              <h2 className="font-bold text-lg text-slate-900 mb-2">Verify Your Fitment</h2>
              <p className="text-sm text-slate-600 mb-3">
                Match the first four characters on your serial plate to one of these prefixes:
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
              {serialLookupPath ? (
                <p className="text-sm text-slate-600">
                  Not sure where your serial plate is?{' '}
                  <Link
                    href={serialLookupPath}
                    className="text-canyon-rust font-semibold underline hover:text-orange-700"
                  >
                    Use our {getDisplayBrand(part.brand)} serial number lookup
                  </Link>
                  .
                </p>
              ) : null}
            </div>
          )}

          {relatedTracks.length > 0 && (
            <section className="mt-8 border border-slate-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                Other tracks for this machine
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Confirm width and pitch on your current track before ordering a different size.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {relatedTracks.map((track) => (
                  <Link
                    key={track.slug}
                    href={`/parts/${track.slug}`}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 hover:border-canyon-rust hover:bg-orange-50/40 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{formatTrackLabel(track)}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{track.name}</p>
                    </div>
                    <span className="text-sm font-bold text-canyon-rust whitespace-nowrap ml-3">
                      ${track.price.toFixed(0)}/ea →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {part.compatible_models && part.compatible_models.length > 0 && (
            <section className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Fits these machine models</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {part.compatible_models.map((model) => (
                  <span
                    key={model}
                    className="bg-white border border-green-200 text-slate-800 text-sm font-semibold px-3 py-1 rounded-full"
                  >
                    {getDisplayBrand(part.brand)} {model}
                  </span>
                ))}
              </div>
              {serialLookupPath && (
                <Link
                  href={serialLookupPath}
                  className="text-sm font-semibold text-green-800 hover:text-green-950 underline"
                >
                  Open serial number lookup →
                </Link>
              )}
            </section>
          )}

          <div className="mt-8 bg-slate-900 text-white rounded-xl p-6">
            <h2 className="text-lg font-bold mb-1">Fleet order or not sure which size?</h2>
            <p className="text-sm text-slate-300 mb-4">
              We help with multi-machine orders, width/pitch confirmation, and bulk track purchases.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:parts@flatearthequipment.com?subject=${encodeURIComponent(`Track quote — ${part.name}`)}`}
                className="inline-flex items-center px-4 py-2 bg-canyon-rust text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm min-h-[44px]"
              >
                Email parts@flatearthequipment.com
              </a>
              <Link
                href={`/quote?equipment=${encodeURIComponent(part.compatible_models?.join(', ') ?? part.name)}&notes=${encodeURIComponent('Rubber track — confirm width/pitch before ordering')}`}
                className="inline-flex items-center px-4 py-2 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors font-medium text-sm min-h-[44px]"
              >
                Request a quote →
              </Link>
            </div>
          </div>

          <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3 max-w-7xl mx-auto">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 truncate">
                  {quantity === 2 ? 'Pair' : 'Single'} · Free shipping
                </p>
                <p className="text-lg font-bold text-slate-900">${lineTotal.toFixed(2)}</p>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                className="shrink-0 bg-canyon-rust hover:bg-orange-700 text-white font-semibold py-3 px-5 rounded-lg min-h-[48px]"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {isSeatListing ? (
            <SeatProductVisual
              name={part.name}
              brand={part.brand}
              category={part.category}
              metadata={part.metadata}
              imageUrl={part.image_url}
              variant="detail"
            />
          ) : (
            part.image_url && (
              <div className="relative aspect-square bg-white rounded-lg shadow-sm p-4">
                <img
                  src={part.image_url}
                  alt={part.name}
                  className="object-contain w-full h-full"
                />
              </div>
            )
          )}
          <div>
            <h1 className="text-3xl font-bold mb-2">{part.name}</h1>
            <p className="text-gray-600 mb-4">{getDisplayBrand(part.brand)}</p>
            {part.description && (
              <div className="text-gray-700 mb-6 whitespace-pre-line">
                {sanitizeCustomerFacingCopy(part.description)}
              </div>
            )}
            {priceBlock}
            {quantitySelector}
            {variantSelector}
            <div className="pt-4">{addToCartButton}</div>
          </div>
        </div>
      )}

      {/* Legacy compatibility section — non-track parts with JCB-style model groupings */}
      {!isRubberTrack && part.compatible_models && part.compatible_models.length > 0 && (
        <section className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
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
            {part.compatible_models.some((m) => m.startsWith('5')) && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Loadall Telehandlers
                </h3>
                <div className="flex flex-wrap gap-2">
                  {part.compatible_models
                    .filter((m) => m.startsWith('5'))
                    .map((model) => (
                      <span
                        key={model}
                        className="bg-white border border-green-100 text-slate-700 text-xs px-2 py-1 rounded"
                      >
                        {model}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {part.compatible_models.some((m) => m.startsWith('4')) && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Wheeled Loaders
                </h3>
                <div className="flex flex-wrap gap-2">
                  {part.compatible_models
                    .filter((m) => m.startsWith('4'))
                    .map((model) => (
                      <span
                        key={model}
                        className="bg-white border border-green-100 text-slate-700 text-xs px-2 py-1 rounded"
                      >
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
            {serialLookupPath ? (
              <Link
                href={serialLookupPath}
                className="text-sm font-semibold text-green-700 hover:text-green-900 underline flex items-center gap-1"
              >
                Open Serial Lookup →
              </Link>
            ) : (
              <Link
                href={`/brand/${part.brand.toLowerCase()}/serial-lookup`}
                className="text-sm font-semibold text-green-700 hover:text-green-900 underline flex items-center gap-1"
              >
                Open Serial Lookup →
              </Link>
            )}
          </div>
        </section>
      )}

      {part.category?.includes('Fork') && (
        <div className="mt-6 bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-slate-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-slate-900 text-white p-3 rounded-lg flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-900 mb-1">Need Different Specs?</h3>
              <p className="text-sm text-slate-600 mb-3">
                Use our Fork Finder to filter by class, length, and width. Find your perfect fit in
                30 seconds.
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

      {part.category?.includes('Fork') && (
        <div className="mt-6 bg-slate-900 text-white border-2 border-slate-700 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-canyon-rust p-3 rounded-lg flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Corporate Buyer?</h3>
              <p className="text-sm text-slate-300 mb-3">
                Fleet pricing, NET-30 terms, and dedicated account management for orders of 10+
                forks.
                <strong className="text-white"> FREE FREIGHT on orders of 15+ forks!</strong>
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
                  Call (888) 392-9175
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {(part.name.toLowerCase().includes('charger module') ||
        part.name.toLowerCase().includes('enersys') ||
        part.name.toLowerCase().includes('hawker')) && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Compare All Charger Module Options
          </h3>
          <p className="text-blue-800 mb-4">
            Looking for other charger modules? View our complete selection with interactive
            comparison and repair vs exchange options.
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
          ⚠️ Operators untrained?{' '}
          <Link href="/safety" className="underline font-medium">
            Get certified online&nbsp;now
          </Link>
          .
        </p>
      </footer>
    </div>
  );
}
