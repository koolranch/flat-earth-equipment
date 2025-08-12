"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check } from "lucide-react";
import { parseSpecsFromSlug, currency, shortDesc } from "@/lib/chargers";
import { BuyNowButton } from "./AddToCartButton";
import QuoteButton from "./QuoteButton";

type Part = {
  name: string;
  slug: string;
  brand: string | null;
  description: string | null;
  image_url: string | null;
  price: string | null;
  price_cents: number | null;
  sku: string | null;
  stripe_price_id?: string | null;
};

type Props = {
  part: Part;
};

export default function FSIPChargerCard({ part }: Props) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const specs = parseSpecsFromSlug(part.slug);
  const price = currency(part.price ?? part.price_cents);
  const desc = shortDesc(part.description, "Industrial battery charger for forklift operations.");

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="brand-card transition hover:shadow-md">
      {/* Image */}
      <div className="aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-neutral-100">
        {part.image_url ? (
          <img
            src={part.image_url}
            alt={part.name}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400 text-sm">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-neutral-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔌</span>
              </div>
              No image
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Product Name */}
        <div className="mb-3">
          <h3 className="font-semibold text-neutral-900">
            <Link href={`/chargers/${part.slug}`} className="hover:text-blue-600 transition-colors">
              {part.name}
            </Link>
          </h3>
          {part.brand && (
            <p className="text-sm subtle mt-1">{part.brand}</p>
          )}
        </div>

        {/* Description */}
        <p className="text-sm subtle mb-3">{desc}</p>

        {/* Spec Chips */}
        <div className="mb-4 flex flex-wrap gap-2">
          {specs.family !== "unknown" && (
            <span className="brand-chip">{specs.family.toUpperCase()}</span>
          )}
          {specs.voltage && (
            <span className="brand-chip">{specs.voltage}V</span>
          )}
          {specs.current && (
            <span className="brand-chip">{specs.current}A</span>
          )}
          {specs.phase !== "unknown" && (
            <span className="brand-chip">{specs.phase}</span>
          )}
        </div>

        {/* Price */}
        <div className="mb-4">
          <span className="text-lg font-semibold text-neutral-900">
            {price || <span className="subtle">Call for pricing</span>}
          </span>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Primary Action */}
          {part.stripe_price_id && price ? (
            <div className="w-full">
              <BuyNowButton
                priceId={part.stripe_price_id}
                slug={part.slug}
                quantity={1}
              />
            </div>
          ) : (
            <QuoteButton
              product={{
                name: part.name,
                slug: part.slug,
                sku: part.sku,
              }}
            />
          )}

          {/* Secondary Actions */}
          <div className="flex items-center justify-between">
            <Link
              href={`/chargers/${part.slug}`}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Details
            </Link>
            
            <div className="flex items-center gap-3">
              {/* Copy SKU */}
              {part.sku && (
                <button
                  onClick={() => copyToClipboard(part.sku!, "sku")}
                  className="inline-flex items-center gap-1 text-xs subtle hover:text-neutral-700"
                  title="Copy SKU"
                >
                  {copiedField === "sku" ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>SKU</span>
                </button>
              )}
              
              {/* Copy Slug */}
              <button
                onClick={() => copyToClipboard(part.slug, "slug")}
                className="inline-flex items-center gap-1 text-xs subtle hover:text-neutral-700"
                title="Copy slug"
              >
                {copiedField === "slug" ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Slug</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
