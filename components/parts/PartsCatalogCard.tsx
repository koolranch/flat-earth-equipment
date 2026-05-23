'use client';

import { useState, type MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { FileText, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import QuoteRequestModal from '@/components/QuoteRequestModal';
import {
  shouldShowBrandChip,
  shouldShowCardStockIndicator,
  type AvailabilityFilter,
} from '@/lib/parts/catalogContext';
import { parsePartSpecs, type SpecChip } from '@/lib/parts/parseSpecs';

export type CatalogCardProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand?: string;
  category?: string;
  price?: number;
  imageUrl?: string;
  salesType: 'direct' | 'quote_only';
  oemReference?: string;
  isInStock?: boolean;
  stripePriceId?: string;
  backordered?: boolean;
  specChips?: SpecChip[];
  classStripeClass?: string | null;
  activeBrandFilter?: string;
  availabilityFilter?: AvailabilityFilter;
};

function SpecChipRow({ chips }: { chips: SpecChip[] }) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <span
          key={`${chip.label}-${chip.value}`}
          className={`rounded px-2 py-1 text-xs ${
            chip.emphasis
              ? 'bg-slate-900 font-semibold text-white'
              : 'bg-slate-100 font-medium text-slate-700'
          }`}
        >
          {chip.label !== 'Size' && chip.label !== 'Capacity' && (
            <span className={chip.emphasis ? 'text-slate-300' : 'text-slate-500'}>
              {chip.label}:{' '}
            </span>
          )}
          {chip.value}
        </span>
      ))}
    </div>
  );
}

function StockIndicator({
  isQuoteOnly,
  backordered,
  isInStock,
}: {
  isQuoteOnly: boolean;
  backordered?: boolean;
  isInStock?: boolean;
}) {
  if (isQuoteOnly) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700">
        <span className="h-2 w-2 rounded-full bg-blue-500" />
        OEM quote
      </span>
    );
  }

  if (backordered) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        Backordered
      </span>
    );
  }

  if (!isInStock) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        Ships 3–5 days
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      In stock
    </span>
  );
}

export default function PartsCatalogCard({ product }: { product: CatalogCardProduct }) {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem } = useCart();

  const isQuoteOnly = product.salesType === 'quote_only';
  const hasPrice = Boolean(product.price && product.price > 0);
  const showBrand = shouldShowBrandChip(product.brand, product.activeBrandFilter);
  const availabilityFilter = product.availabilityFilter ?? 'all';
  const showStockIndicator = shouldShowCardStockIndicator(availabilityFilter, {
    salesType: product.salesType,
    isInStock: product.isInStock,
    backordered: product.backordered,
  });
  const showImageBadge =
    showStockIndicator &&
    (isQuoteOnly || product.backordered || !product.isInStock);

  const specChips =
    product.specChips ??
    parsePartSpecs({
      name: product.name,
      category: product.category,
    });

  const handleAddToCart = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!product.stripePriceId) {
      toast.error('This item is not available for online checkout yet.');
      return;
    }

    setIsAddingToCart(true);
    addItem({
      id: product.id,
      name: product.name,
      price: product.price ?? 0,
      stripe_price_id: product.stripePriceId,
      image_url: product.imageUrl,
      quantity: 1,
    });

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

    setIsAddingToCart(false);
  };

  return (
    <>
      <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-[#F76511] hover:shadow-md">
        <Link href={`/parts/${product.slug}`} className="block">
          <div className="relative mb-2 h-36 overflow-hidden rounded-lg bg-slate-50">
            {product.classStripeClass && (
              <span
                className={`absolute left-0 top-0 z-10 h-full w-1.5 ${product.classStripeClass}`}
                aria-hidden="true"
              />
            )}
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                Image coming soon
              </div>
            )}
            {specChips.length > 0 && (
              <div className="absolute left-2 top-2 z-10 max-w-[calc(100%-1rem)] sm:hidden">
                <SpecChipRow chips={specChips.slice(0, 2)} />
              </div>
            )}
            {showImageBadge && (
              <span
                className={`absolute right-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  isQuoteOnly
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {isQuoteOnly ? 'OEM' : product.backordered ? 'Backordered' : 'Lead time'}
              </span>
            )}
          </div>
        </Link>

        <div className="flex flex-1 flex-col gap-1.5">
          {specChips.length > 0 && (
            <div className="hidden sm:block">
              <SpecChipRow chips={specChips} />
            </div>
          )}

          {showBrand && (
            <span className="inline-flex w-fit rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
              {product.brand}
            </span>
          )}

          <Link
            href={`/parts/${product.slug}`}
            className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition-colors hover:text-[#F76511]"
          >
            {product.name}
          </Link>

          <p className="font-mono text-[11px] text-slate-500">{product.sku}</p>

          <div className="mt-auto flex items-end justify-between gap-2 pt-1">
            {isQuoteOnly || !hasPrice ? (
              <>
                <div>
                  <span className="text-sm font-semibold text-slate-700">Call for price</span>
                  {showStockIndicator && (
                    <div className="mt-0.5">
                      <StockIndicator
                        isQuoteOnly={isQuoteOnly}
                        backordered={product.backordered}
                        isInStock={product.isInStock}
                      />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="flex h-9 shrink-0 items-center gap-1 rounded-lg bg-[#F76511] px-3 text-xs font-semibold text-white transition-colors hover:bg-orange-600"
                  aria-label="Request quote"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Quote
                </button>
              </>
            ) : (
              <>
                <div>
                  <span className="text-lg font-bold text-slate-900">
                    ${product.price!.toFixed(2)}
                  </span>
                  {showStockIndicator && (
                    <div className="mt-0.5">
                      <StockIndicator
                        isQuoteOnly={false}
                        backordered={product.backordered}
                        isInStock={product.isInStock}
                      />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !product.stripePriceId}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F76511] text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Add to cart"
                  title="Add to cart"
                >
                  {isAddingToCart ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </article>

      <QuoteRequestModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        part={{
          id: product.id,
          name: product.name,
          sku: product.sku,
          oemReference: product.oemReference,
          brand: product.brand,
        }}
      />
    </>
  );
}
