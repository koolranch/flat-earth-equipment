"use client";

import { useState, useEffect } from "react";
import { HelpCircle, Info } from "lucide-react";
import { type FilterOptions, type SelectorFilters } from "@/lib/batteryChargers";
import HelpTooltip from "./HelpTooltip";

type Props = {
  filterOptions: FilterOptions;
  filters: SelectorFilters;
  onFiltersChange: (filters: SelectorFilters) => void;
  resultsCount: number;
  onNotSureClick: () => void;
};

export default function ChargerSelector({
  filterOptions,
  filters,
  onFiltersChange,
  resultsCount,
  onNotSureClick,
}: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [batteryAh, setBatteryAh] = useState<string>("");
  const [chargeTime, setChargeTime] = useState<string>("overnight");
  const [recommendedAmps, setRecommendedAmps] = useState<number | null>(null);

  // Auto-calculate recommended amps based on battery Ah and desired charge time
  useEffect(() => {
    if (batteryAh && chargeTime) {
      const ah = parseInt(batteryAh);
      if (ah > 0) {
        let amps = 0;
        if (chargeTime === "overnight") {
          // 8-12 hour charge (conservative, battery-friendly)
          amps = Math.round(ah / 10);
        } else if (chargeTime === "fast") {
          // 4-6 hour charge (faster but more wear)
          amps = Math.round(ah / 5);
        } else if (chargeTime === "opportunity") {
          // 2-3 hour opportunity charging
          amps = Math.round(ah / 3);
        }
        
        if (amps > 0) {
          setRecommendedAmps(amps);
          // Auto-update the current filter with recommended amps
          onFiltersChange({
            ...filters,
            current: amps,
          });
        }
      }
    }
  }, [batteryAh, chargeTime, filters, onFiltersChange]);

  // Auto-advance steps when selections are made
  useEffect(() => {
    if (filters.voltage && step === 1) {
      setStep(2);
    } else if (recommendedAmps && step === 2) {
      setStep(3);
    }
  }, [filters.voltage, recommendedAmps, step]);

  const handleVoltageChange = (voltage: number | null) => {
    onFiltersChange({
      ...filters,
      voltage,
      // Reset dependent filters when voltage changes
      current: null,
      phase: null,
    });
    if (voltage) setStep(2);
  };

  const handlePhaseChange = (phase: string | null) => {
    onFiltersChange({
      ...filters,
      phase,
    });
  };

  const handleChemistryChange = (chemistry: string[]) => {
    onFiltersChange({
      ...filters,
      chemistry,
    });
  };

  const isStepComplete = (stepNum: number) => {
    switch (stepNum) {
      case 1: return filters.voltage !== null;
      case 2: return recommendedAmps !== null;
      case 3: return filters.phase !== null;
      default: return false;
    }
  };

  const getStepStatus = (stepNum: number) => {
    if (stepNum < step) return "complete";
    if (stepNum === step) return "active";
    return "pending";
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          Find Your Perfect Charger
        </h2>
        <p className="text-neutral-600 text-sm">
          Answer 3 quick questions to find compatible chargers for your forklift battery.
        </p>
      </div>

      {/* Step Progress Indicator */}
      <div className="flex items-center mb-8">
        {[1, 2, 3].map((stepNum) => {
          const status = getStepStatus(stepNum);
          return (
            <div key={stepNum} className="flex items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                  ${status === "complete" 
                    ? "bg-green-100 text-green-700 border-2 border-green-200" 
                    : status === "active"
                    ? "bg-blue-100 text-blue-700 border-2 border-blue-200"
                    : "bg-neutral-100 text-neutral-500 border-2 border-neutral-200"
                  }
                `}
              >
                {status === "complete" ? "✓" : stepNum}
              </div>
              {stepNum < 3 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  stepNum < step ? "bg-green-200" : "bg-neutral-200"
                }`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-6">
        {/* Step 1: Battery Voltage */}
        <div className={`transition-opacity ${step >= 1 ? "opacity-100" : "opacity-50"}`}>
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-3">
            <span>
              <span className="text-blue-600 font-semibold">Step 1:</span> What's your battery voltage?
            </span>
            <HelpTooltip content="Your battery voltage determines charger compatibility. Most forklifts use 24V, 36V, 48V, or 80V batteries. Check your battery label, nameplate, or forklift manual." />
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {filterOptions.voltages.map((voltage) => (
              <button
                key={voltage}
                onClick={() => handleVoltageChange(voltage)}
                className={`
                  px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all
                  ${filters.voltage === voltage
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                  }
                `}
              >
                {voltage}V
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-neutral-500">
            <Info className="w-3 h-3" />
            <span>Check your battery label or forklift manual</span>
          </div>
        </div>

        {/* Step 2: Battery Capacity & Charge Time */}
        {step >= 2 && (
          <div className={`transition-opacity ${step >= 2 ? "opacity-100" : "opacity-50"}`}>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-3">
              <span>
                <span className="text-blue-600 font-semibold">Step 2:</span> Battery capacity & charging needs
              </span>
              <HelpTooltip content="Battery capacity (Ah) and desired charge time help us calculate the perfect charger amperage. Higher amps = faster charging but may reduce battery life." />
            </label>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Battery Ah Input */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-2">
                  Battery Capacity (Ah)
                </label>
                <input
                  type="number"
                  value={batteryAh}
                  onChange={(e) => setBatteryAh(e.target.value)}
                  placeholder="e.g., 750"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Find this on your battery label (Amp-hours)
                </p>
              </div>

              {/* Charge Time Selection */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-2">
                  Desired Charge Time
                </label>
                <select
                  value={chargeTime}
                  onChange={(e) => setChargeTime(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="overnight">Overnight (8-12 hrs)</option>
                  <option value="fast">Fast Charge (4-6 hrs)</option>
                  <option value="opportunity">Opportunity (2-3 hrs)</option>
                </select>
                <p className="text-xs text-neutral-500 mt-1">
                  Longer charges are gentler on batteries
                </p>
              </div>
            </div>

            {/* Recommended Amps Display */}
            {recommendedAmps && (
              <div className="mt-4 bg-blue-50 border border-blue-200 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-blue-900">
                    Recommended Charger Output: {recommendedAmps} Amps
                  </span>
                </div>
                <p className="text-xs text-blue-700">
                  Perfect for a {batteryAh}Ah battery with {chargeTime === "overnight" ? "overnight" : chargeTime === "fast" ? "fast" : "opportunity"} charging.
                  {chargeTime === "overnight" && " Most battery-friendly option."}
                  {chargeTime === "fast" && " Good balance of speed and battery life."}
                  {chargeTime === "opportunity" && " Quick top-ups during breaks."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Input Phase/Voltage */}
        {step >= 3 && (
          <div className={`transition-opacity ${step >= 3 ? "opacity-100" : "opacity-50"}`}>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-3">
              <span>
                <span className="text-blue-600 font-semibold">Step 3:</span> What's your facility's input power?
              </span>
              <HelpTooltip content="Your facility's electrical supply determines which chargers will work. Single-phase (208-240V) is common in smaller facilities, while three-phase (480V) is standard in industrial settings." />
            </label>
            <div className="space-y-3">
              {[
                { value: "1P", label: "Single-phase 208-240V", desc: "Most common in smaller facilities" },
                { value: "3P", label: "Three-phase 480V", desc: "Industrial facilities, faster charging" },
              ].map((option) => (
                <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="phase"
                    value={option.value}
                    checked={filters.phase === option.value}
                    onChange={(e) => handlePhaseChange(e.target.value)}
                    className="mt-1 w-4 h-4 text-blue-600 border-neutral-300 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-neutral-900">{option.label}</div>
                    <div className="text-xs text-neutral-600">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-neutral-500">
              <Info className="w-3 h-3" />
              <span>Check your electrical panel or ask your electrician</span>
            </div>
          </div>
        )}

        {/* Optional Chemistry Filter */}
        {step >= 3 && (
          <div className="pt-4 border-t border-neutral-200">
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Battery chemistry (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.chemistries.map((chemistry) => (
                <label key={chemistry} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.chemistry.includes(chemistry)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleChemistryChange([...filters.chemistry, chemistry]);
                      } else {
                        handleChemistryChange(filters.chemistry.filter(c => c !== chemistry));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-neutral-700">{chemistry}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Counter & Not Sure Link */}
      <div className="mt-6 pt-6 border-t border-neutral-200 flex items-center justify-between">
        <div className="text-sm">
          <span className="font-medium text-neutral-900">
            Showing {resultsCount} compatible charger{resultsCount !== 1 ? "s" : ""}
          </span>
          {resultsCount > 0 && resultsCount <= 3 && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              Best Match
            </span>
          )}
        </div>
        
        <button
          onClick={onNotSureClick}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <HelpCircle className="w-4 h-4" />
          Not sure? Get help
        </button>
      </div>
    </div>
  );
}