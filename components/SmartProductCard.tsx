'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShoppingCart, 
  FileText, 
  CheckCircle, 
  Package, 
  AlertCircle,
  ExternalLink,
  Phone
} from 'lucide-react';
import QuoteRequestModal from './QuoteRequestModal';

interface SmartProductCardProps {
  product: {
    id?: string;
    name: string;
    slug: string;
    sku: string;
    brand?: string;
    description?: string;
    price?: number;
    priceCents?: number;
    imageUrl?: string;
    salesType: 'direct' | 'quote_only';
    oemReference?: string;
    isInStock?: boolean;
    compatibleModels?: string[];
  };
  machine?: {
    model: string;
    brand: string;
  } | null;
  showDescription?: boolean;
  compact?: boolean;
}

export default function SmartProductCard({
  product,
  machine,
  showDescription = true,
  compact = false,
}: SmartProductCardProps) {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const isQuoteOnly = product.salesType === 'quote_only';
  const hasPrice = (product.price && product.price > 0) || (product.priceCents && product.priceCents > 0);
  const displayPrice = product.priceCents 
    ? (product.priceCents / 100).toFixed(2) 
    : product.price?.toFixed(2);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    // TODO: Implement Stripe checkout or cart logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsAddingToCart(false);
    // Show success toast or redirect to cart
  };

  return (
    <>
      <div className={`
        bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md
        ${compact ? 'p-4' : 'p-5'}
      `}>
        {/* Product Image */}
        {product.imageUrl && !compact && (
          <div className="relative aspect-square mb-4 bg-slate-100 rounded-lg overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain p-4"
            />
            {/* Stock Badge */}
            {!isQuoteOnly && (
              <div className={`
                absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium
                ${product.isInStock 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-amber-100 text-amber-700'
                }
              `}>
                {product.isInStock ? 'In Stock' : 'Ships in 3-5 days'}
              </div>
            )}
            {isQuoteOnly && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                OEM Part
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="space-y-3">
          {/* Brand & OEM Reference */}
          <div className="flex flex-wrap items-center gap-2">
            {product.brand && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded">
                {product.brand}
              </span>
            )}
            {product.oemReference && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-mono rounded">
                OEM: {product.oemReference}
              </span>
            )}
          </div>

          {/* Product Name */}
          <Link 
            href={`/parts/${product.slug}`}
            className="block font-semibold text-slate-900 hover:text-canyon-rust transition-colors line-clamp-2"
          >
            {product.name}
          </Link>

          {/* SKU */}
          <p className="text-sm text-slate-500">SKU: {product.sku}</p>

          {/* Description */}
          {showDescription && product.description && !compact && (
            <p className="text-sm text-slate-600 line-clamp-2">{product.description}</p>
          )}

          {/* Compatible Models Tag */}
          {machine && product.compatibleModels?.includes(machine.model.toLowerCase().replace(/\s+/g, '-')) && (
            <div className="flex items-center gap-1.5 text-sm text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              Verified fit for {machine.brand} {machine.model}
            </div>
          )}

          {/* Price Section */}
          <div className="pt-2 border-t">
            {isQuoteOnly ? (
              // Quote-Only Pricing
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-lg font-bold text-slate-900">Call for Price</span>
                </div>
                <p className="text-xs text-slate-500">
                  OEM parts require quote verification
                </p>
                <button
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-canyon-rust to-orange-600 text-white font-semibold rounded-lg hover:from-canyon-rust/90 hover:to-orange-600/90 transition-all shadow-md"
                >
                  <FileText className="w-5 h-5" />
                  Request OEM Quote
                </button>
              </div>
            ) : hasPrice ? (
              // Direct Purchase Pricing
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">${displayPrice}</span>
                  {product.isInStock && (
                    <span className="text-xs text-emerald-600 font-medium">Ready to ship</span>
                  )}
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  {isAddingToCart ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            ) : (
              // No price available
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Price not available</span>
                </div>
                <button
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:border-canyon-rust hover:text-canyon-rust transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  Request Quote
                </button>
              </div>
            )}
          </div>

          {/* View Details Link */}
          <Link
            href={`/parts/${product.slug}`}
            className="flex items-center justify-center gap-1 text-sm text-slate-500 hover:text-canyon-rust transition-colors"
          >
            View Details
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Quote Request Modal */}
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
        machine={machine}
      />
    </>
  );
}

// Export a mini version for use in compatibility hub
export function MiniProductCard({
  product,
  machine,
  onRequestQuote,
}: {
  product: {
    name: string;
    sku: string;
    brand?: string;
    oemReference?: string;
    salesType: 'direct' | 'quote_only';
    priceCents?: number;
  };
  machine?: { model: string; brand: string } | null;
  onRequestQuote?: () => void;
}) {
  const isQuoteOnly = product.salesType === 'quote_only';
  
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 truncate">{product.name}</p>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
          {product.brand && <span>{product.brand}</span>}
          <span className="font-mono">{product.oemReference || product.sku}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 ml-4">
        {isQuoteOnly ? (
          <button
            onClick={onRequestQuote}
            className="px-3 py-1.5 bg-canyon-rust/10 text-canyon-rust text-sm font-medium rounded-lg hover:bg-canyon-rust/20 transition-colors"
          >
            Get Quote
          </button>
        ) : product.priceCents ? (
          <>
            <span className="font-bold text-slate-900">
              ${(product.priceCents / 100).toFixed(2)}
            </span>
            <button className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
              <ShoppingCart className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={onRequestQuote}
            className="px-3 py-1.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:border-slate-400 transition-colors"
          >
            Request Quote
          </button>
        )}
      </div>
    </div>
  );
}

