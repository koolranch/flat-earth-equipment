"use client";

import { useEffect, useMemo, useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import HelpTooltip from "./HelpTooltip";

type Props = {
  onFilterChange: (filters: { 
    voltage?: number | null; 
    amps?: number | null; 
    phase?: "1P" | "3P" | null;
  }) => void;
  resultsCount: number;
  onNotSureClick: () => void;
};

/** Beginner-first selector: Voltage → Charge Speed; optional Advanced: Battery Ah (refines amps) */
export default function ChargerSelector({ 
  onFilterChange, 
  resultsCount, 
  onNotSureClick 
}: Props) {
  const [voltage, setVoltage] = useState<string>("");
  const [speed, setSpeed] = useState<"overnight" | "fast">("overnight");
  const [phase, setPhase] = useState<"1P" | "3P" | "">("");

  // Advanced (optional)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [batteryAh, setBatteryAh] = useState<string>("");

  // Reasonable mid-range assumptions by voltage (for lead-acid fleets)
  const assumedAhByVoltage: Record<string, number> = {
    "24": 600,
    "36": 750,
    "48": 750,
    "80": 1000,
  };

  const baseAh = useMemo(() => {
    if (!voltage) return null;
    const custom = parseInt(batteryAh || "", 10);
    if (!Number.isNaN(custom) && custom > 0) return custom;
    return assumedAhByVoltage[voltage] ?? null;
  }, [voltage, batteryAh]);

  // Very simple "rule of thumb":
  // - Overnight (~8–12h): ~C/10 ≈ Ah/10
  // - Fast (~4–6h): ~C/5  ≈ Ah/5
  const recommendedAmps = useMemo(() => {
    if (!baseAh) return null;
    const denom = speed === "overnight" ? 10 : 5;
    return Math.max(10, Math.round(baseAh / denom));
  }, [baseAh, speed]);

  useEffect(() => {
    onFilterChange({
      voltage: voltage ? Number(voltage) : null,
      amps: recommendedAmps ?? null,
      phase: (phase || null) as any,
    });
  }, [voltage, recommendedAmps, phase, onFilterChange]);

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          Find Your Perfect Charger
        </h2>
        <p className="text-neutral-600 text-sm">
          Tell us your battery voltage and preferred charging speed. We'll recommend the perfect charger.
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Battery Voltage */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-3">
            <span>
              <span className="text-blue-600 font-semibold">Step 1:</span> Battery Voltage
            </span>
            <HelpTooltip content="Your battery voltage determines charger compatibility. Most forklifts use 24V, 36V, 48V, or 80V batteries. Check your battery label, nameplate, or forklift manual." />
          </label>
          
          <select
            value={voltage}
            onChange={(e) => setVoltage(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select voltage</option>
            {[24, 36, 48, 80].map((v) => (
              <option key={v} value={String(v)}>
                {v}V
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-neutral-500">
            If you're not sure, check the forklift battery label or manual.
          </p>
        </div>

        {/* Step 2: Charge Speed (beginner-friendly) */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-3">
            <span>
              <span className="text-blue-600 font-semibold">Step 2:</span> Charge Speed
            </span>
            <HelpTooltip content="Choose how fast you need charging. Overnight charging is gentler on batteries and most common. Faster charging reduces downtime but may impact battery lifespan." />
          </label>
          
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setSpeed("overnight")}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                speed === "overnight"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
              }`}
            >
              <div className="font-semibold">Standard Overnight</div>
              <div className="text-sm opacity-80">Typical 8–12 hours</div>
              <div className="text-xs mt-1 opacity-70">Most battery-friendly</div>
            </button>
            
            <button
              type="button"
              onClick={() => setSpeed("fast")}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                speed === "fast"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
              }`}
            >
              <div className="font-semibold">Faster Charge</div>
              <div className="text-sm opacity-80">Roughly 4–6 hours</div>
              <div className="text-xs mt-1 opacity-70">Higher amp output</div>
            </button>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            Higher amps = faster charging. We'll pick the right charger amp rating for you.
          </p>
        </div>

        {/* Step 3: Facility Power / Phase (optional but helpful) */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-3">
            <span>
              <span className="text-blue-600 font-semibold">Step 3:</span> Facility Power (optional)
            </span>
            <HelpTooltip content="Your facility's electrical supply determines which chargers will work. Single-phase (208-240V) is common in smaller facilities, while three-phase (480V/600V) is standard in industrial settings." />
          </label>
          
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Single-phase (208–240V)", val: "1P" },
              { label: "Three-phase (480/600V)", val: "3P" },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setPhase(opt.val as any)}
                className={`rounded-xl border px-4 py-2 text-sm transition-all ${
                  phase === opt.val
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPhase("" as any)}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 hover:border-neutral-300"
            >
              Not sure
            </button>
          </div>
        </div>

        {/* Recommendation Summary */}
        <div className="rounded-xl border bg-neutral-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm">
              <span className="font-semibold text-neutral-900">Recommended charger output:</span>{" "}
              {recommendedAmps ? (
                <span className="text-blue-700 font-semibold">{recommendedAmps} A</span>
              ) : (
                <span className="text-neutral-500">Select voltage & speed</span>
              )}
            </div>
          </div>
          
          {voltage && (
            <p className="text-xs text-neutral-600 mb-3">
              We estimate a charger based on a typical {voltage}V battery. {speed === "fast" ? "Faster" : "Standard"} speed uses {speed === "fast" ? "higher" : "moderate"} amp output.
            </p>
          )}

          {/* Advanced Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showAdvanced ? "Hide Advanced" : "Advanced: I know my battery Ah"}
          </button>

          {/* Advanced Section */}
          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-2">
                    Battery Capacity (Ah)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={100}
                    step={50}
                    value={batteryAh}
                    onChange={(e) => setBatteryAh(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 750"
                  />
                </div>
                <div className="text-xs text-neutral-500 self-end pb-2">
                  Find this on your battery label. We'll refine the amp recommendation based on your exact capacity.
                </div>
              </div>
            </div>
          )}
        </div>
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