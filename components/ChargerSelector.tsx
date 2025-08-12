"use client";

import { useState, useEffect } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { type FilterOptions, type SelectorFilters } from "@/lib/batteryChargers";

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

  // Auto-advance steps when selections are made
  useEffect(() => {
    if (filters.voltage && step === 1) {
      setStep(2);
    } else if (filters.current && step === 2) {
      setStep(3);
    }
  }, [filters.voltage, filters.current, step]);

  // Get available current options based on selected voltage
  const availableCurrentOptions = filterOptions.currentAmps.filter(current => {
    // For this step, we want to show currents that exist for the selected voltage
    // This would require actual cross-filtering, but for now show all
    return true;
  });

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

  const handleCurrentChange = (current: number | null) => {
    onFiltersChange({
      ...filters,
      current,
      // Reset dependent filters when current changes
      phase: null,
    });
    if (current) setStep(3);
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
      case 2: return filters.current !== null;
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
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            <span className="text-blue-600 font-semibold">Step 1:</span> What's your battery voltage?
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
        </div>

        {/* Step 2: Charger Output Amps */}
        {step >= 2 && (
          <div className={`transition-opacity ${step >= 2 ? "opacity-100" : "opacity-50"}`}>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              <span className="text-blue-600 font-semibold">Step 2:</span> Desired charger output (amps)?
            </label>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {availableCurrentOptions.map((current) => (
                <button
                  key={current}
                  onClick={() => handleCurrentChange(current)}
                  className={`
                    px-3 py-3 rounded-xl border-2 text-sm font-medium transition-all
                    ${filters.current === current
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                    }
                  `}
                >
                  {current}A
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Input Phase/Voltage */}
        {step >= 3 && (
          <div className={`transition-opacity ${step >= 3 ? "opacity-100" : "opacity-50"}`}>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              <span className="text-blue-600 font-semibold">Step 3:</span> What's your facility's input power?
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
