'use client';

import { useState, type MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { FileText, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import QuoteRequestModal from '@/components/QuoteRequestModal';
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
};

function SpecChipRow({ chips }: { chips: SpecChip[] }) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {chips.map((chip) => (
        <span
          key={`${chip.label}-${chip.value}`}
          className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-700"
        >
          {chip.label !== 'Size' && (
            <span className="text-slate-500">{chip.label}: </span>
          )}
          {chip.value}
        </span>
      ))}
    </div>
  );
}

export default function PartsCatalogCard({ product }: { product: CatalogCardProduct }) {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem } = useCart();

  const isQuoteOnly = product.salesType === 'quote_only';
  const hasPrice = Boolean(product.price && product.price > 0);
  const specChips =
    product.specChips ??
    parsePartSpecs({ name: product.name, category: product.category });

  const stockLabel = product.backordered
    ? 'Backordered'
    : product.isInStock
      ? 'In Stock'
      : 'Ships 3–5 days';

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
            <span
              className={`absolute right-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                isQuoteOnly
                  ? 'bg-blue-100 text-blue-700'
                  : product.backordered
                    ? 'bg-amber-100 text-amber-700'
                    : product.isInStock
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isQuoteOnly ? 'OEM' : stockLabel}
            </span>
          </div>
        </Link>

        <div className="flex flex-1 flex-col space-y-1.5">
          <SpecChipRow chips={specChips} />

          {product.brand && (
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

          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            {isQuoteOnly || !hasPrice ? (
              <>
                <span className="text-sm font-semibold text-slate-700">Call for price</span>
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
                <span className="text-lg font-bold text-slate-900">
                  ${product.price!.toFixed(2)}
                </span>
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
