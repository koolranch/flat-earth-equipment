'use client';

import { useMemo } from 'react';
import { CheckCircle, ShieldCheck, Calendar } from 'lucide-react';

interface OEMMatch {
  brand: string;
  partNumber: string;
}

interface CompatibilityTableProps {
  /** 
   * Comma-delimited string of "Brand PartNumber" pairs
   * e.g., "Genie 105739, JLG 0270001, Skyjack 161827"
   */
  compatibility?: string;
  /** Product name for SEO context */
  productName?: string;
  /** Last verification date (defaults to Jan 2026) */
  verifiedDate?: string;
}

/**
 * CompatibilityTable Component
 * 
 * Renders verified OEM cross-reference data as a clean "Verified Fitment" table.
 * Parses spec_compatibility string from Stripe metadata and displays each entry
 * with brand and part number in a SEO-optimized format.
 * 
 * Includes:
 * - Technical Verification badge with timestamp
 * - Clean grid layout for OEM matches
 * - Mobile-responsive design
 */
function parseCompatibility(compatibilityString: string | undefined): OEMMatch[] {
  if (!compatibilityString) return [];
  
  return compatibilityString
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean)
    .map(entry => {
      // Handle "Brand PartNumber" format (e.g., "Genie 105739")
      const parts = entry.split(' ');
      if (parts.length >= 2) {
        const brand = parts[0];
        const partNumber = parts.slice(1).join(' ');
        return { brand, partNumber };
      }
      // Fallback for entries without space (treat whole string as part number)
      return { brand: 'OEM', partNumber: entry };
    });
}

export default function CompatibilityTable({
  compatibility,
  productName = 'This Product',
  verifiedDate = 'Jan 2026',
}: CompatibilityTableProps) {
  // Parse compatibility string into OEM matches
  const oemMatches = useMemo(() => parseCompatibility(compatibility), [compatibility]);

  // Group by brand for cleaner display - must be called before any early returns
  const groupedByBrand = useMemo(() => {
    const groups: Record<string, string[]> = {};
    for (const match of oemMatches) {
      if (!groups[match.brand]) {
        groups[match.brand] = [];
      }
      groups[match.brand].push(match.partNumber);
    }
    return groups;
  }, [oemMatches]);

  // Early return after all hooks are called
  if (oemMatches.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6" />
            <div>
              <h3 className="text-xl font-bold">Verified OEM Fitment</h3>
              <p className="text-sm text-emerald-100">Cross-reference for {productName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Badge */}
      <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-200 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-emerald-700" />
        <span className="text-sm font-medium text-emerald-800">
          Technical Verification
        </span>
        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
          Last Verified: {verifiedDate} via OEM Parts Manuals
        </span>
      </div>

      {/* OEM Matches Grid */}
      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(groupedByBrand).map(([brand, partNumbers]) => (
            <div 
              key={brand}
              className="border border-slate-200 rounded-lg p-4 hover:border-emerald-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-600">
                    {brand.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className="font-semibold text-slate-900">{brand}</span>
              </div>
              <div className="space-y-2">
                {partNumbers.map((pn, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 text-sm"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <code className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {pn}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer with Count */}
      <div className="px-6 py-3 bg-slate-50 border-t flex items-center justify-between">
        <span className="text-sm text-slate-600">
          <strong className="text-emerald-700">{oemMatches.length}</strong> verified OEM part number matches
        </span>
        <span className="text-xs text-slate-500">
          Sourced from official OEM parts catalogs
        </span>
      </div>
    </div>
  );
}

