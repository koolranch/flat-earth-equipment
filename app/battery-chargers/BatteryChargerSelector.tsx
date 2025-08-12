"use client";

import { useState, useMemo } from "react";
import { type BatteryCharger, parseChargerSpecs } from "@/lib/batteryChargers";
import ChargerSelector from "@/components/ChargerSelector";
import ChargerCard from "@/components/ChargerCard";
import ChargerHelpModal from "@/components/ChargerHelpModal";
import QuoteModal from "@/components/QuoteModal";

type Props = {
  chargers: BatteryCharger[];
};

type SelectorFilters = {
  voltage?: number | null;
  amps?: number | null;
  phase?: "1P" | "3P" | null;
};

export default function BatteryChargerSelector({ chargers }: Props) {
  const [uiFilters, setUiFilters] = useState<SelectorFilters>({});
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedCharger, setSelectedCharger] = useState<BatteryCharger | null>(null);

  // Filter chargers based on current selections with tolerance
  const filteredChargers = useMemo(() => {
    return chargers.filter((charger) => {
      const specs = parseChargerSpecs(charger);

      // Voltage filter (exact match)
      if (uiFilters.voltage && specs.voltage !== uiFilters.voltage) {
        return false;
      }

      // Phase filter (exact match if specified)
      if (uiFilters.phase && specs.phase !== uiFilters.phase) {
        return false;
      }

      // Amps filter with tolerance (±10A so we don't over-filter)
      if (uiFilters.amps) {
        const tolerance = 10;
        const chargerAmps = specs.current || 0;
        const targetAmps = uiFilters.amps;
        if (!(chargerAmps >= (targetAmps - tolerance) && chargerAmps <= (targetAmps + tolerance))) {
          return false;
        }
      }

      return true;
    });
  }, [chargers, uiFilters]);

  // Sort by closeness to recommended amps so the best match rises to the top
  const sortedChargers = useMemo(() => {
    if (!uiFilters.amps) return filteredChargers;

    return [...filteredChargers].sort((a, b) => {
      const specsA = parseChargerSpecs(a);
      const specsB = parseChargerSpecs(b);
      const targetAmps = uiFilters.amps || 0;
      const deltaA = Math.abs((specsA.current || 0) - targetAmps);
      const deltaB = Math.abs((specsB.current || 0) - targetAmps);
      return deltaA - deltaB;
    });
  }, [filteredChargers, uiFilters.amps]);

  const handleQuoteClick = (charger: BatteryCharger) => {
    setSelectedCharger(charger);
    setQuoteModalOpen(true);
  };

  const handleQuoteSubmit = async (payload: any) => {
    const response = await fetch("/api/quote-charger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        product_name: selectedCharger?.name || "",
        product_slug: selectedCharger?.slug || "",
        product_sku: selectedCharger?.sku || "",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Quote submit failed:", response.status, errorText);
      throw new Error("Failed to submit quote request");
    }
  };

  return (
    <div className="space-y-8">
      {/* Selector Component */}
      <ChargerSelector
        onFilterChange={setUiFilters}
        resultsCount={sortedChargers.length}
        onNotSureClick={() => setHelpModalOpen(true)}
      />

      {/* Results Section */}
      {sortedChargers.length > 0 ? (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">
              Compatible Chargers
              {sortedChargers.length <= 3 && (
                <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                  Best Match
                </span>
              )}
            </h2>
            <p className="text-neutral-600 mt-1">
              {sortedChargers.length} charger{sortedChargers.length !== 1 ? "s" : ""} match your requirements
              {uiFilters.amps && " (sorted by closest amp rating)"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedChargers.map((charger) => (
              <ChargerCard
                key={charger.id}
                charger={charger}
                onQuoteClick={handleQuoteClick}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.469-.742-6.21-2.002M6 9.5L5.5 9l-.5-.5L6 9.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            No chargers match your criteria
          </h3>
          <p className="text-neutral-600 mb-4">
            Try adjusting your filters or get a custom recommendation
          </p>
          <button
            onClick={() => setHelpModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            Get Expert Recommendation
          </button>
        </div>
      )}

      {/* Initial State - Show All Chargers */}
      {!uiFilters.voltage && !uiFilters.amps && !uiFilters.phase && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">
              All Battery Chargers
            </h2>
            <p className="text-neutral-600 mt-1">
              Browse our complete selection or use the selector above to filter by your requirements
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {chargers.slice(0, 12).map((charger) => (
              <ChargerCard
                key={charger.id}
                charger={charger}
                onQuoteClick={handleQuoteClick}
              />
            ))}
          </div>
          
          {chargers.length > 12 && (
            <div className="text-center mt-8">
              <p className="text-neutral-600 text-sm">
                Showing 12 of {chargers.length} chargers. Use the selector above to find specific models.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ChargerHelpModal
        open={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />

      {selectedCharger && (
        <QuoteModal
          open={quoteModalOpen}
          onClose={() => {
            setQuoteModalOpen(false);
            setSelectedCharger(null);
          }}
          onSubmit={handleQuoteSubmit}
          product={{
            name: selectedCharger.name,
            slug: selectedCharger.slug,
            sku: selectedCharger.sku,
          }}
        />
      )}
    </div>
  );
}