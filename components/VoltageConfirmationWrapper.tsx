'use client';

import { useState, useEffect, ReactNode } from 'react';
import VoltageSelectionModal, { isVoltageConfirmed } from './VoltageSelectionModal';
import { AlertTriangle, Zap, Lock, CheckCircle2 } from 'lucide-react';

interface VoltageConfirmationWrapperProps {
  brand: string;
  modelName: string;
  voltageOptions: number[] | null;
  requiresVoltageConfirmation: boolean;
  currentVoltage?: number | null;
  children: ReactNode;
  onVoltageConfirmed?: (voltage: number) => void;
}

export default function VoltageConfirmationWrapper({
  brand,
  modelName,
  voltageOptions,
  requiresVoltageConfirmation,
  currentVoltage,
  children,
  onVoltageConfirmed,
}: VoltageConfirmationWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmedVoltage, setConfirmedVoltage] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Check for stored voltage on mount
  useEffect(() => {
    if (requiresVoltageConfirmation && voltageOptions && voltageOptions.length > 1) {
      const stored = isVoltageConfirmed(brand, modelName);
      if (stored) {
        setConfirmedVoltage(stored);
        setIsLocked(false);
      } else {
        setIsLocked(true);
      }
    }
  }, [brand, modelName, requiresVoltageConfirmation, voltageOptions]);

  const handleVoltageSelect = (voltage: number) => {
    setConfirmedVoltage(voltage);
    setIsLocked(false);
    onVoltageConfirmed?.(voltage);
  };

  // If no voltage confirmation required, just render children
  if (!requiresVoltageConfirmation || !voltageOptions || voltageOptions.length <= 1) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Voltage Warning Banner */}
      {isLocked && (
        <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 mb-1">
                Voltage Confirmation Required
              </h3>
              <p className="text-amber-800 mb-3">
                Your <span className="font-semibold">{brand} {modelName}</span> can be configured with {voltageOptions.join('V, ')}V batteries.
                Please check your battery data plate and confirm your voltage before adding chargers to cart.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
              >
                <Zap className="w-4 h-4" />
                Select My Voltage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmed Voltage Badge */}
      {confirmedVoltage && !isLocked && (
        <div className="mb-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-emerald-700">Voltage Confirmed</p>
                <p className="font-bold text-emerald-900">{confirmedVoltage}V Battery System</p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm text-emerald-600 hover:text-emerald-800 font-medium underline"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Cart Lock Overlay */}
      {isLocked ? (
        <div className="relative">
          <div className="opacity-60 pointer-events-none select-none">
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-xl">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-amber-600" />
              </div>
              <p className="text-lg font-semibold text-slate-900 mb-2">Confirm Your Voltage First</p>
              <p className="text-sm text-slate-600 mb-4 max-w-xs mx-auto">
                Select your battery voltage to unlock charger recommendations
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-lg"
              >
                <Zap className="w-5 h-5" />
                Confirm Voltage
              </button>
            </div>
          </div>
        </div>
      ) : (
        children
      )}

      {/* Modal */}
      <VoltageSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleVoltageSelect}
        brand={brand}
        modelName={modelName}
        voltageOptions={voltageOptions}
        currentVoltage={confirmedVoltage}
      />
    </>
  );
}

// Export a locked button component for use in product cards
export function LockedCartButton({
  onRequestVoltage,
  isLocked,
  children,
}: {
  onRequestVoltage: () => void;
  isLocked: boolean;
  children: ReactNode;
}) {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <button
      onClick={onRequestVoltage}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-100 text-amber-800 font-medium rounded-lg border border-amber-300 hover:bg-amber-200 transition-colors"
    >
      <Lock className="w-4 h-4" />
      Confirm Voltage to Add to Cart
    </button>
  );
}

