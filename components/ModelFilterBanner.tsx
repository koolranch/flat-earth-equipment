'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Truck, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface ModelFilterBannerProps {
  /** The type of products being filtered (e.g., "forks", "chargers") */
  productType: 'forks' | 'chargers' | 'parts';
  /** Optional custom title */
  title?: string;
  /** Optional custom description */
  description?: string;
}

// Storage key for selected model
const SELECTED_MODEL_KEY = 'flatearth_selected_model';

interface SelectedModel {
  brand: string;
  model: string;
  slug: string;
  brandSlug: string;
}

export default function ModelFilterBanner({
  productType,
  title,
  description,
}: ModelFilterBannerProps) {
  const [selectedModel, setSelectedModel] = useState<SelectedModel | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Load selected model from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SELECTED_MODEL_KEY);
      if (stored) {
        setSelectedModel(JSON.parse(stored) as SelectedModel);
      }
      
      // Check if banner was dismissed this session
      const dismissedKey = `flatearth_banner_dismissed_${productType}`;
      if (sessionStorage.getItem(dismissedKey)) {
        setDismissed(true);
      }
    } catch {
      // Ignore storage errors
    }
  }, [productType]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(`flatearth_banner_dismissed_${productType}`, 'true');
    } catch {
      // Ignore storage errors
    }
  };

  // Don't show if dismissed
  if (dismissed) return null;

  const productLabels = {
    forks: { plural: 'forks', singular: 'fork' },
    chargers: { plural: 'chargers', singular: 'charger' },
    parts: { plural: 'parts', singular: 'part' },
  };
  const labels = productLabels[productType];

  // If model is selected, show personalized message
  if (selectedModel) {
    const displayModel = `${selectedModel.brand} ${selectedModel.model}`;
    
    return (
      <div className="relative bg-gradient-to-r from-emerald-600 to-green-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-200 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">
                  Filtering for: <span className="text-emerald-100">{displayModel}</span>
                </p>
                <p className="text-sm text-emerald-100">
                  Showing verified compatible {labels.plural}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/compatibility/${selectedModel.brandSlug}/${selectedModel.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-50 transition-colors shadow-sm"
              >
                View Full Compatibility
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/compatibility"
                className="text-sm text-emerald-100 hover:text-white underline underline-offset-2"
              >
                Change model
              </Link>
            </div>
          </div>
        </div>
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 text-emerald-200 hover:text-white transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // No model selected - show CTA to select
  return (
    <div className="relative bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-2.5 bg-slate-600/50 rounded-lg">
              <Truck className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">
                {title || `Filter by Forklift Model`}
              </h3>
              <p className="text-slate-300 text-sm mt-0.5">
                {description || `Find ${labels.plural} verified to fit your specific equipment`}
              </p>
            </div>
          </div>
          <Link
            href="/compatibility"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25"
          >
            Select Your Model
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-white transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

