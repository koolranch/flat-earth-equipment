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
      {/* Step-by-step Selector */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Find Your Perfect Charger
          </h2>
          <p className="mt-2 text-gray-600">
            Answer these questions to get personalized recommendations
          </p>
        </div>
        
        <ChargerSelector onFilterChange={handleFilterChange} />
      </div>

      {/* Smart Recommendations Section */}
      <RecommendationsBlock 
        filters={currentFilters}
        fallbackItems={fallbackItems}
      />
    </div>
  );
}