"use client";

import { useState, useCallback } from "react";
import { type BatteryCharger } from "@/lib/batteryChargers";
import type { RecommendInput } from "@/types/recommendations";
import BatteryChargerSelector from "./BatteryChargerSelector";
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
  const [bestMatchCount, setBestMatchCount] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<RecommendInput>({
    voltage: initialFilters.voltage ?? null,
    amps: initialFilters.amps ?? null,
    phase: initialFilters.phase ?? null,
    chemistry: initialFilters.chemistry ?? null,
    limit: 6
  });

  const handleBestMatchCountChange = useCallback((count: number) => {
    setBestMatchCount(count);
  }, []);

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
      // Don't update chemistry and limit from this callback
    }));
  }, []);

  return (
    <div className="space-y-8">
      {/* Selector Component with Best Match count */}
      <BatteryChargerSelector 
        chargers={chargers}
        hideResults={true}
        bestMatchCount={bestMatchCount}
        onFilterChange={handleFilterChange}
      />
      
      {/* Debug Info for Development */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mb-4 p-2 bg-gray-50 rounded text-xs text-gray-600">
          <strong>Debug:</strong> Amp tolerance: {process.env.NEXT_PUBLIC_RECS_AMP_TOLERANCE_PCT || process.env.RECS_AMP_TOLERANCE_PCT || '12'}% | Best Match Count: {bestMatchCount}
        </div>
      )}

      {/* Smart Recommendations Section */}
      <RecommendationsBlock 
        filters={currentFilters}
        fallbackItems={fallbackItems}
        onBestMatchCountChange={handleBestMatchCountChange}
      />
    </div>
  );
}
