'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Search, Truck, ArrowRight, X } from 'lucide-react';

interface FitmentValidatorProps {
  /** Stripe product ID to check compatibility against */
  productId?: string;
  /** Product name for display */
  productName?: string;
  /** Comma-separated list of compatible models from Stripe metadata */
  compatibilityList?: string;
  /** Compact mode for smaller display contexts */
  compact?: boolean;
}

// Storage key for selected model
const SELECTED_MODEL_KEY = 'flatearth_selected_model';

interface SelectedModel {
  brand: string;
  model: string;
  slug: string;
  brandSlug: string;
}

export default function FitmentValidator({
  productId,
  productName,
  compatibilityList,
  compact = false,
}: FitmentValidatorProps) {
  const [selectedModel, setSelectedModel] = useState<SelectedModel | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  // Load selected model from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SELECTED_MODEL_KEY);
      if (stored) {
        const model = JSON.parse(stored) as SelectedModel;
        setSelectedModel(model);
        
        // Check if this product is compatible with the selected model
        if (compatibilityList && model.model) {
          const compatibleModels = compatibilityList
            .toLowerCase()
            .split(',')
            .map(m => m.trim());
          const modelName = model.model.toLowerCase();
          const isMatch = compatibleModels.some(
            cm => cm.includes(modelName) || modelName.includes(cm)
          );
          setIsVerified(isMatch);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [compatibilityList]);

  // Handle clearing selection
  const handleClear = () => {
    localStorage.removeItem(SELECTED_MODEL_KEY);
    setSelectedModel(null);
    setIsVerified(null);
    setInputValue('');
  };

  // If user has selected a model previously
  if (selectedModel) {
    const displayModel = `${selectedModel.brand} ${selectedModel.model}`;
    
    return (
      <div className={`bg-gradient-to-r ${isVerified ? 'from-emerald-50 to-green-50 border-emerald-200' : 'from-amber-50 to-yellow-50 border-amber-200'} border rounded-xl ${compact ? 'p-4' : 'p-5'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {isVerified ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Search className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`font-semibold ${isVerified ? 'text-emerald-900' : 'text-amber-900'} ${compact ? 'text-sm' : 'text-base'}`}>
                {isVerified ? 'Verified Fit' : 'Compatibility Check'}
              </h4>
              <p className={`${isVerified ? 'text-emerald-700' : 'text-amber-700'} ${compact ? 'text-xs' : 'text-sm'} mt-0.5`}>
                {isVerified ? (
                  <>
                    ✅ <span className="font-medium">{displayModel}</span>
                  </>
                ) : (
                  <>
                    Your selected model: <span className="font-medium">{displayModel}</span>
                    <br />
                    <span className="text-amber-600">
                      Check the <Link href={`/compatibility/${selectedModel.brandSlug}/${selectedModel.slug}`} className="underline hover:text-amber-800">compatibility page</Link> for full fitment details.
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleClear}
            className={`${isVerified ? 'text-emerald-400 hover:text-emerald-600' : 'text-amber-400 hover:text-amber-600'} transition-colors p-1`}
            aria-label="Clear selected model"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Link to change model */}
        <div className={`mt-3 pt-3 border-t ${isVerified ? 'border-emerald-200' : 'border-amber-200'}`}>
          <Link
            href="/compatibility"
            className={`inline-flex items-center gap-1.5 text-xs ${isVerified ? 'text-emerald-600 hover:text-emerald-800' : 'text-amber-600 hover:text-amber-800'} font-medium transition-colors`}
          >
            <Truck className="w-3.5 h-3.5" />
            Change Model
          </Link>
        </div>
      </div>
    );
  }

  // No model selected - show input prompt
  return (
    <div className={`bg-slate-50 border border-slate-200 rounded-xl ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex items-start gap-3">
        <Search className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className={`font-semibold text-slate-800 ${compact ? 'text-sm' : 'text-base'}`}>
            Compatibility Check
          </h4>
          <p className={`text-slate-600 ${compact ? 'text-xs' : 'text-sm'} mt-1`}>
            Verify this {productName ? `${productName} fits` : 'product fits'} your equipment before ordering.
          </p>
          
          {/* Quick Model Entry */}
          <div className="mt-3">
            <Link
              href="/compatibility"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
            >
              <Truck className="w-4 h-4" />
              Find Your Model
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Hint text */}
          <p className="mt-2 text-xs text-slate-500">
            Toyota, Hyster, Yale, CAT, JLG, Genie & more
          </p>
        </div>
      </div>
    </div>
  );
}

// Export a utility to save selected model (for use in compatibility pages)
export function saveSelectedModel(model: SelectedModel): void {
  try {
    localStorage.setItem(SELECTED_MODEL_KEY, JSON.stringify(model));
  } catch {
    // Ignore localStorage errors
  }
}

export function getSelectedModel(): SelectedModel | null {
  try {
    const stored = localStorage.getItem(SELECTED_MODEL_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

