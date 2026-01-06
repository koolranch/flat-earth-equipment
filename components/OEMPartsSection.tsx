'use client';

import { useState } from 'react';
import { Package, FileText, Phone, Wrench, ChevronRight, AlertCircle } from 'lucide-react';
import QuoteRequestModal from './QuoteRequestModal';

interface OEMPart {
  id: string;
  name: string;
  sku: string;
  oem_reference: string | null;
  brand: string;
  category: string;
  description: string;
  sales_type: 'direct' | 'quote_only';
  is_in_stock: boolean;
  price_cents?: number | null;
}

interface OEMPartsSectionProps {
  parts: OEMPart[];
  machineBrand: string;
  machineModel: string;
}

export default function OEMPartsSection({
  parts,
  machineBrand,
  machineModel,
}: OEMPartsSectionProps) {
  const [selectedPart, setSelectedPart] = useState<OEMPart | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const handleRequestQuote = (part: OEMPart) => {
    setSelectedPart(part);
    setIsQuoteModalOpen(true);
  };

  if (!parts || parts.length === 0) {
    return null;
  }

  // Group parts by category
  const partsByCategory = parts.reduce((acc, part) => {
    const category = part.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(part);
    return acc;
  }, {} as Record<string, OEMPart[]>);

  return (
    <>
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Wrench className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Common Wear Parts</h2>
            <p className="text-slate-600">OEM replacement parts for {machineBrand} {machineModel}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 flex items-center justify-between">
            <span className="text-white font-semibold flex items-center gap-2">
              <Package className="w-5 h-5" />
              OEM Parts — Request Pricing & Availability
            </span>
            <span className="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
              {parts.length} Parts
            </span>
          </div>

          {/* Parts List */}
          <div className="divide-y divide-slate-100">
            {Object.entries(partsByCategory).map(([category, categoryParts]) => (
              <div key={category}>
                {/* Category Header */}
                <div className="px-6 py-3 bg-slate-50 border-b">
                  <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">
                    {category}
                  </h3>
                </div>

                {/* Parts in Category */}
                {categoryParts.map((part) => (
                  <div
                    key={part.id}
                    className="px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Part Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900">
                            {part.name.replace(` - ${machineBrand} ${machineModel}`, '')}
                          </span>
                          {part.sales_type === 'quote_only' && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              OEM
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <code className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-mono text-xs">
                            {part.oem_reference || part.sku}
                          </code>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">{part.brand}</span>
                        </div>
                        {part.description && (
                          <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                            {part.description}
                          </p>
                        )}
                      </div>

                      {/* Price / Quote Button */}
                      <div className="flex items-center gap-3">
                        {part.sales_type === 'direct' && part.price_cents ? (
                          <>
                            <span className="font-bold text-slate-900">
                              ${(part.price_cents / 100).toFixed(2)}
                            </span>
                            <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
                              Add to Cart
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-slate-500 text-sm">
                                <Phone className="w-3.5 h-3.5" />
                                Call for Price
                              </div>
                            </div>
                            <button
                              onClick={() => handleRequestQuote(part)}
                              className="px-4 py-2 bg-gradient-to-r from-canyon-rust to-orange-600 text-white text-sm font-medium rounded-lg hover:from-canyon-rust/90 hover:to-orange-600/90 transition-all flex items-center gap-1.5"
                            >
                              <FileText className="w-4 h-4" />
                              Get Quote
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="px-6 py-4 bg-slate-50 border-t flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-600">
              <p className="font-medium text-slate-700 mb-1">OEM Part Sourcing</p>
              <p>
                These are genuine OEM parts that require verification for your specific serial number.
                Request a quote for current pricing and lead times. Most parts ship within 3-7 business days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Request Modal */}
      {selectedPart && (
        <QuoteRequestModal
          isOpen={isQuoteModalOpen}
          onClose={() => {
            setIsQuoteModalOpen(false);
            setSelectedPart(null);
          }}
          part={{
            id: selectedPart.id,
            name: selectedPart.name,
            sku: selectedPart.sku,
            oemReference: selectedPart.oem_reference || undefined,
            brand: selectedPart.brand,
          }}
          machine={{
            model: machineModel,
            brand: machineBrand,
          }}
        />
      )}
    </>
  );
}

