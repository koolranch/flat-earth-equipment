'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle, ArrowRight, Wrench, Calendar } from 'lucide-react';

// Re-export data utilities from lib for backwards compatibility
export { 
  COMPATIBILITY_DATA, 
  getCompatibilityBySlug, 
  getCompatibilityByBrand, 
  getAllBrands,
  type CompatibilityEntry,
} from '@/lib/compatibility-data';

interface CompatibleModel {
  brand: string;
  model: string;
}

interface CompatibilityHubProps {
  /** 
   * Comma-delimited string of compatible forklift models
   * e.g., "JLG 1930ES, JLG 2030ES, Genie GS-1930, Skyjack SJIII 3219"
   */
  compatibilityList?: string;
  /**
   * Comma-delimited string of OEM reference part numbers
   * e.g., "JLG 0270001, Genie 105739, Skyjack 161827"
   */
  oemRefs?: string;
  /** Product name for context */
  productName?: string;
  /** Product slug for generating links */
  productSlug?: string;
  /** Show "View Charger Details" link */
  showProductLink?: boolean;
  /** Compact mode - less padding, smaller grid */
  compact?: boolean;
}

/**
 * CompatibilityHub Component
 * 
 * "Verified Fitment Matrix" - displays compatible forklift models and OEM references
 * in a clean, scannable grid format. Designed for:
 * 
 * 1. Product Detail Pages - show which equipment models this charger fits
 * 2. SEO Landing Pages - /compatibility/[brand]/[model] pages
 * 
 * Includes:
 * - Technical Verification badge with 2026 Fleet Compliance stamp
 * - Brand-grouped model display for easy scanning
 * - OEM cross-reference numbers for parts managers
 * - Internal links to compatibility landing pages
 */
function parseCompatibilityList(listString: string | undefined): CompatibleModel[] {
  if (!listString) return [];
  
  return listString
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean)
    .map(entry => {
      // Parse "Brand Model" format (e.g., "JLG 1930ES" or "Toyota 8FBCU25")
      const parts = entry.split(' ');
      if (parts.length >= 2) {
        const brand = parts[0];
        const model = parts.slice(1).join(' ');
        return { brand, model };
      }
      // Handle cases with no space (rare)
      return { brand: 'Other', model: entry };
    });
}

function parseOEMRefs(refsString: string | undefined): Array<{ brand: string; partNumber: string }> {
  if (!refsString) return [];
  
  return refsString
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean)
    .map(entry => {
      const parts = entry.split(' ');
      if (parts.length >= 2) {
        return { brand: parts[0], partNumber: parts.slice(1).join(' ') };
      }
      return { brand: 'OEM', partNumber: entry };
    });
}

export default function CompatibilityHub({
  compatibilityList,
  oemRefs,
  productName = 'This Charger',
  productSlug,
  showProductLink = false,
  compact = false,
}: CompatibilityHubProps) {
  // Parse compatibility list into models
  const compatibleModels = useMemo(() => parseCompatibilityList(compatibilityList), [compatibilityList]);
  
  // Group models by brand for display
  const modelsByBrand = useMemo(() => {
    const groups: Record<string, string[]> = {};
    for (const { brand, model } of compatibleModels) {
      if (!groups[brand]) {
        groups[brand] = [];
      }
      groups[brand].push(model);
    }
    return groups;
  }, [compatibleModels]);

  // Parse OEM references
  const oemReferences = useMemo(() => parseOEMRefs(oemRefs), [oemRefs]);
  
  // Group OEM refs by brand
  const oemByBrand = useMemo(() => {
    const groups: Record<string, string[]> = {};
    for (const { brand, partNumber } of oemReferences) {
      if (!groups[brand]) {
        groups[brand] = [];
      }
      groups[brand].push(partNumber);
    }
    return groups;
  }, [oemReferences]);

  if (compatibleModels.length === 0) {
    return null;
  }

  // Brand color mapping for visual distinction
  const brandColors: Record<string, { bg: string; text: string; border: string }> = {
    JLG: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
    Genie: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    Skyjack: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
    Toyota: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
    Hyster: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    Yale: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
    Jungheinrich: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
    EZGO: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
    Cushman: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
    'Taylor-Dunn': { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
    BT: { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200' },
  };

  const getColors = (brand: string) => brandColors[brand] || { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200' };

  return (
    <div className={`bg-white rounded-xl shadow-lg border overflow-hidden ${compact ? '' : ''}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Verified Fitment Matrix</h3>
              <p className="text-sm text-slate-300">Equipment compatibility for {productName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Verification Badge */}
      <div className="px-6 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-200 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-800">Technical Verification</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Verified for 2026 Fleet Compliance
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-emerald-700 ml-auto">
          <Calendar className="w-3 h-3" />
          Last Updated: Jan 2026
        </div>
      </div>

      {/* Models Grid by Brand */}
      <div className={`${compact ? 'p-4' : 'p-6'}`}>
        <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
          Compatible Equipment Models
        </h4>
        <div className={`grid gap-4 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {Object.entries(modelsByBrand).map(([brand, models]) => {
            const colors = getColors(brand);
            return (
              <div 
                key={brand}
                className={`${colors.bg} ${colors.border} border rounded-lg p-4 hover:shadow-md transition-shadow`}
              >
                {/* Brand Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 ${colors.bg} border ${colors.border} rounded-full flex items-center justify-center`}>
                    <span className={`text-xs font-bold ${colors.text}`}>
                      {brand.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span className={`font-bold ${colors.text}`}>{brand}</span>
                </div>
                
                {/* Model List */}
                <div className="space-y-2">
                  {models.map((model, idx) => {
                    const slug = `${brand.toLowerCase()}-${model.toLowerCase().replace(/\s+/g, '-')}`;
                    return (
                      <Link
                        key={idx}
                        href={`/compatibility/${brand.toLowerCase()}/${model.toLowerCase().replace(/\s+/g, '-')}`}
                        className="flex items-center gap-2 text-sm group"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className={`font-medium ${colors.text} group-hover:underline`}>
                          {model}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* OEM Cross-Reference Section */}
      {oemReferences.length > 0 && (
        <div className={`border-t bg-slate-50 ${compact ? 'p-4' : 'p-6'}`}>
          <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
            OEM Part Number Cross-Reference
          </h4>
          <div className="flex flex-wrap gap-3">
            {Object.entries(oemByBrand).map(([brand, partNumbers]) => (
              <div key={brand} className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">{brand}:</span>
                {partNumbers.map((pn, idx) => (
                  <code 
                    key={idx}
                    className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-slate-700"
                  >
                    {pn}
                  </code>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-100 border-t flex items-center justify-between">
        <span className="text-sm text-slate-600">
          <strong className="text-emerald-700">{compatibleModels.length}</strong> verified equipment models
          {oemReferences.length > 0 && (
            <> • <strong className="text-blue-700">{oemReferences.length}</strong> OEM part numbers</>
          )}
        </span>
        {showProductLink && productSlug && (
          <Link
            href={`/chargers/${productSlug}`}
            className="text-sm font-medium text-canyon-rust hover:text-canyon-rust/80 flex items-center gap-1 transition-colors"
          >
            View Charger Details
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}


