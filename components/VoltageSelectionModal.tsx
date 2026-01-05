'use client';

import { useState, useEffect } from 'react';
import { X, Zap, AlertTriangle, CheckCircle2, Battery, Info } from 'lucide-react';

interface VoltageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (voltage: number) => void;
  modelName: string;
  brand: string;
  voltageOptions: number[];
  currentVoltage?: number | null;
}

const VOLTAGE_STORAGE_KEY = 'flatearth_confirmed_voltage';

interface StoredVoltageSelection {
  brand: string;
  model: string;
  voltage: number;
  confirmedAt: string;
}

export default function VoltageSelectionModal({
  isOpen,
  onClose,
  onSelect,
  modelName,
  brand,
  voltageOptions,
  currentVoltage,
}: VoltageSelectionModalProps) {
  const [selectedVoltage, setSelectedVoltage] = useState<number | null>(currentVoltage ?? null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedVoltage(currentVoltage ?? null);
      setIsConfirmed(false);
    }
  }, [isOpen, currentVoltage]);

  const handleConfirm = () => {
    if (selectedVoltage) {
      // Save to localStorage for persistence
      const selection: StoredVoltageSelection = {
        brand,
        model: modelName,
        voltage: selectedVoltage,
        confirmedAt: new Date().toISOString(),
      };
      localStorage.setItem(VOLTAGE_STORAGE_KEY, JSON.stringify(selection));
      
      setIsConfirmed(true);
      onSelect(selectedVoltage);
      
      // Close after brief success animation
      setTimeout(() => {
        onClose();
      }, 800);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Voltage Confirmation Required</h2>
                <p className="text-amber-100 text-sm">Select your battery voltage</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Model Info */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <Battery className="w-8 h-8 text-slate-600" />
              <div>
                <p className="text-sm text-slate-500">Your Equipment</p>
                <p className="font-semibold text-slate-900">{brand} {modelName}</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Check Your Battery Data Plate</p>
              <p>Your {modelName} can be configured with different battery voltages. 
              Please verify your battery's voltage rating before proceeding to ensure charger compatibility.</p>
            </div>
          </div>

          {/* Voltage Options */}
          <div className="space-y-3 mb-6">
            <p className="text-sm font-medium text-slate-700">Select Your Battery Voltage:</p>
            <div className="grid gap-3">
              {voltageOptions.sort((a, b) => a - b).map((voltage) => (
                <button
                  key={voltage}
                  onClick={() => setSelectedVoltage(voltage)}
                  className={`
                    flex items-center justify-between p-4 rounded-xl border-2 transition-all
                    ${selectedVoltage === voltage 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${selectedVoltage === voltage ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}
                    `}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className={`font-semibold ${selectedVoltage === voltage ? 'text-blue-900' : 'text-slate-900'}`}>
                        {voltage}V Battery System
                      </p>
                      <p className="text-sm text-slate-500">
                        {voltage <= 24 && 'Low voltage (small equipment)'}
                        {voltage === 36 && 'Standard voltage (Class I-II)'}
                        {voltage === 48 && 'High efficiency (Class I-II)'}
                        {voltage >= 72 && 'High capacity (heavy duty)'}
                      </p>
                    </div>
                  </div>
                  {selectedVoltage === voltage && (
                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedVoltage || isConfirmed}
              className={`
                flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2
                ${selectedVoltage && !isConfirmed
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }
                ${isConfirmed ? 'bg-green-500 text-white' : ''}
              `}
            >
              {isConfirmed ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Confirmed!
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Confirm {selectedVoltage ? `${selectedVoltage}V` : 'Voltage'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility functions for voltage storage
export function getStoredVoltageSelection(): StoredVoltageSelection | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(VOLTAGE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function clearStoredVoltageSelection(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(VOLTAGE_STORAGE_KEY);
}

export function isVoltageConfirmed(brand: string, model: string): number | null {
  const stored = getStoredVoltageSelection();
  if (stored && stored.brand === brand && stored.model === model) {
    return stored.voltage;
  }
  return null;
}

