'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronDown, 
  AlertTriangle, 
  Wrench, 
  FileText,
  Zap,
  Battery,
  Signal,
  ThermometerSun,
  RotateCcw
} from 'lucide-react';
import type { FaultCode } from '@/lib/fault-codes-data';

// Re-export for backwards compatibility
export type { FaultCode } from '@/lib/fault-codes-data';
export { FAULT_CODES_DATA, getFaultCodesForModel } from '@/lib/fault-codes-data';

interface FaultCodesAccordionProps {
  brand: string;
  model: string;
  faultCodes: FaultCode[];
  onRequestQuote?: (partSku: string, partName: string) => void;
}

// Fault code icons based on code type
const getFaultIcon = (code: string) => {
  const lowerCode = code.toLowerCase();
  if (lowerCode.includes('bat') || lowerCode === 'll') return Battery;
  if (lowerCode.includes('temp') || lowerCode.includes('th')) return ThermometerSun;
  if (lowerCode.includes('comm') || lowerCode.includes('e5')) return Signal;
  if (lowerCode.includes('ti') || lowerCode.includes('tilt')) return RotateCcw;
  return Zap;
};

const severityColors = {
  low: 'bg-blue-100 text-blue-700 border-blue-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high: 'bg-red-100 text-red-700 border-red-200',
};

const severityLabels = {
  low: 'Advisory',
  medium: 'Warning',
  high: 'Critical',
};

export default function FaultCodesAccordion({
  brand,
  model,
  faultCodes,
  onRequestQuote,
}: FaultCodesAccordionProps) {
  const [openCode, setOpenCode] = useState<string | null>(null);

  if (!faultCodes || faultCodes.length === 0) {
    return null;
  }

  const toggleCode = (code: string) => {
    setOpenCode(openCode === code ? null : code);
  };

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Common Fault Codes</h2>
          <p className="text-slate-600">Troubleshooting guide for {brand} {model}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-3">
          <span className="text-white font-semibold flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Diagnostic Codes & Solutions
          </span>
        </div>

        {/* Fault Codes List */}
        <div className="divide-y divide-slate-100">
          {faultCodes.map((fault) => {
            const isOpen = openCode === fault.code;
            const IconComponent = getFaultIcon(fault.code);
            
            return (
              <div key={fault.code} className="group">
                {/* Accordion Header */}
                <button
                  onClick={() => toggleCode(fault.code)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      fault.severity === 'high' ? 'bg-red-100' :
                      fault.severity === 'medium' ? 'bg-amber-100' : 'bg-blue-100'
                    }`}>
                      <IconComponent className={`w-5 h-5 ${
                        fault.severity === 'high' ? 'text-red-600' :
                        fault.severity === 'medium' ? 'text-amber-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-0.5 bg-slate-800 text-white text-sm font-mono rounded">
                          {fault.code}
                        </code>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${severityColors[fault.severity]}`}>
                          {severityLabels[fault.severity]}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900 mt-1">{fault.name}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Accordion Content */}
                {isOpen && (
                  <div className="px-6 pb-6 bg-slate-50 border-t">
                    <div className="pt-4 space-y-4">
                      {/* Description */}
                      <p className="text-slate-700">{fault.description}</p>

                      {/* Causes */}
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          Common Causes
                        </h4>
                        <ul className="space-y-1">
                          {fault.causes.map((cause, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                              <span className="text-slate-400 mt-1">•</span>
                              {cause}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Solutions */}
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-emerald-500" />
                          Recommended Solutions
                        </h4>
                        <ol className="space-y-1">
                          {fault.solutions.map((solution, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                              <span className="font-semibold text-slate-500 min-w-[20px]">{i + 1}.</span>
                              {solution}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Related Parts */}
                      {fault.relatedParts && fault.relatedParts.length > 0 && (
                        <div className="bg-white rounded-lg p-4 border border-slate-200">
                          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-canyon-rust" />
                            Need the part to fix this?
                          </h4>
                          <div className="space-y-2">
                            {fault.relatedParts.map((part) => (
                              <div key={part.sku} className="flex items-center justify-between">
                                <div>
                                  <span className="font-medium text-slate-700">{part.name}</span>
                                  <code className="ml-2 px-1.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-mono rounded">
                                    {part.sku}
                                  </code>
                                </div>
                                {onRequestQuote ? (
                                  <button
                                    onClick={() => onRequestQuote(part.sku, part.name)}
                                    className="px-3 py-1.5 bg-canyon-rust text-white text-sm font-medium rounded-lg hover:bg-canyon-rust/90 transition-colors"
                                  >
                                    Request Quote
                                  </button>
                                ) : (
                                  <Link
                                    href={`/parts?sku=${part.sku}`}
                                    className="px-3 py-1.5 bg-canyon-rust text-white text-sm font-medium rounded-lg hover:bg-canyon-rust/90 transition-colors"
                                  >
                                    Request Quote
                                  </Link>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t text-sm text-slate-600">
          <p>
            <strong>Note:</strong> Fault codes may vary by model year and firmware version. 
            Always consult your operator manual or contact a certified technician for complex diagnostics.
          </p>
        </div>
      </div>
    </section>
  );
}

// Note: Data has been moved to @/lib/fault-codes-data.ts for server-side access

