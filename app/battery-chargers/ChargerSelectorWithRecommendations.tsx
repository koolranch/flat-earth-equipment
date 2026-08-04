"use client";

import { useState, useCallback } from "react";
import { type BatteryCharger } from "@/lib/batteryChargers";
import type { RecommendInput } from "@/types/recommendations";
import ChargerSelector from "@/components/ChargerSelector";
import RecommendationsBlock from "@/components/RecommendationsBlock";

type Props = {
  chargers: BatteryCharger[];
  initialFilters?: Partial<RecommendInput>;
  fallbackItems: any[];
};

export default function ChargerSelectorWithRecommendations({ 
  initialFilters = {},
  fallbackItems 
}: Props) {
  const [currentFilters, setCurrentFilters] = useState<RecommendInput>({
    voltage: initialFilters.voltage ?? null,
    amps: initialFilters.amps ?? null,
    phase: initialFilters.phase ?? null,
    chemistry: initialFilters.chemistry ?? null,
    limit: 12
  });

  const handleFilterChange = useCallback((filters: { 
    voltage?: number | null; 
    amps?: number | null; 
    phase?: '1P' | '3P' | null; 
    speed?: 'overnight' | 'fast' | null 
  }) => {
    setCurrentFilters(prev => ({
      ...prev,
      voltage: filters.voltage,
      amps: filters.amps,
      phase: filters.phase,
    }));
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-200 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-canyon-rust mb-1">
            Optional helper
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Need help choosing a charger?
          </h2>
          <p className="text-gray-600">
            Answer three quick questions and we&apos;ll match live stocked chargers to your voltage, charge speed, and facility power.
          </p>
        </div>
        
        <div className="p-6 sm:p-8">
          <ChargerSelector onFilterChange={handleFilterChange} />
        </div>
      </div>

      <RecommendationsBlock 
        filters={currentFilters}
        fallbackItems={fallbackItems}
      />
    </div>
  );
}