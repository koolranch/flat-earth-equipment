"use client";

import { useState } from "react";
import Link from "next/link";
import { Truck, Copy, Check } from "lucide-react";
import { type BatteryCharger, parseChargerSpecs, formatPrice, isQuickShip, calculateChargeTime } from "@/lib/batteryChargers";
import { BuyNowButton } from "./AddToCartButton";
import QuoteButton from "./QuoteButton";

type Props = {
  charger: BatteryCharger;
  onQuoteClick: (charger: BatteryCharger) => void;
};

export default function ChargerCard({ charger, onQuoteClick }: Props) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const specs = parseChargerSpecs(charger);
  const price = formatPrice(charger.price, charger.price_cents);
  const quickShip = isQuickShip(charger);
  
  // Estimate charge time for common battery sizes
  const estimatedChargeTime = specs.current 
    ? calculateChargeTime(specs.voltage === 24 ? 460 : specs.voltage === 36 ? 750 : specs.voltage === 48 ? 1000 : 800, specs.current)
    : "N/A";

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleQuoteClick = () => {
    onQuoteClick(charger);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100 relative">
        {quickShip && (
          <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
            <Truck className="w-3 h-3" />
            Quick Ship
          </div>
        )}
        
        {charger.image_url ? (
          <img
            src={charger.image_url}
            alt={charger.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
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
      <div className="p-5">
        {/* Product Name & Brand */}
        <div className="mb-3">
          <h3 className="font-semibold text-neutral-900 text-lg leading-tight">
            <Link href={`/chargers/${charger.slug}`} className="hover:text-blue-600 transition-colors">
              {charger.name}
            </Link>
          </h3>
          {charger.brand && (
            <p className="text-sm text-neutral-500 mt-1">{charger.brand}</p>
          )}
        </div>

        {/* Key Specs as Bullets */}
        <div className="mb-4 space-y-2">
          {/* Voltage + Chemistry */}
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
            <span className="text-neutral-700">
              {specs.voltage ? `${specs.voltage}V` : "Variable V"} {specs.chemistry.join(" / ")}
            </span>
          </div>
          
          {/* Output Current + Charge Time */}
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
            <span className="text-neutral-700">
              {specs.current ? `${specs.current}A` : "Variable A"} – {estimatedChargeTime} charge time
            </span>
          </div>
          
          {/* Input Phase/Voltage */}
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></span>
            <span className="text-neutral-700">
              {specs.phase !== "unknown" ? (
                specs.phase === "1P" ? "Single-phase 208-240V" : "Three-phase 480V"
              ) : "Multi-input voltage"}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <span className="text-lg font-semibold text-neutral-900">
            {price}
          </span>
          {charger.has_core_charge && charger.core_charge && parseFloat(charger.core_charge) > 0 && (
            <span className="ml-2 text-sm text-neutral-600">
              + ${parseFloat(charger.core_charge).toFixed(2)} core
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary CTA */}
          {charger.stripe_price_id && price !== "Call for pricing" ? (
            <div className="w-full">
              <BuyNowButton
                priceId={charger.stripe_price_id}
                slug={charger.slug}
                quantity={1}
              />
            </div>
          ) : (
            <button
              onClick={handleQuoteClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              Request Quote
            </button>
          )}

          {/* Secondary Actions */}
          <div className="flex items-center justify-between">
            <Link
              href={`/chargers/${charger.slug}`}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View details
            </Link>
            
            <div className="flex items-center gap-3">
              {/* Copy SKU */}
              {charger.sku && (
                <button
                  onClick={() => copyToClipboard(charger.sku!, "sku")}
                  className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700"
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
              
              {/* Quote Button */}
              <button
                onClick={handleQuoteClick}
                className="text-xs text-neutral-500 hover:text-neutral-700 font-medium"
              >
                Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}