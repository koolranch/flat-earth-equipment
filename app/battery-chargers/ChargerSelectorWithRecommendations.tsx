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
  chargers, 
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
      {/* Enhanced Step-by-step Selector */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100/80 px-8 py-6 border-b border-slate-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Forklift Charger Selector: Find Your Perfect Match
          </h2>
          <p className="text-lg text-gray-600">
            Choose your battery voltage, charging speed, and facility power type for personalized forklift charger recommendations
          </p>
        </div>
        
        <div className="p-8">
          <ChargerSelector onFilterChange={handleFilterChange} />
        </div>
      </div>

      {/* Smart Recommendations Section */}
      <RecommendationsBlock 
        filters={currentFilters}
        fallbackItems={fallbackItems}
      />
    </div>
  );
}