'use client';

import { useState, useMemo } from 'react';

interface SpecRow {
  label: string;
  classII?: string;
  classIII?: string;
  classIV?: string;
  value?: string;
  note?: string;
}

interface TechnicalSpecsTableProps {
  title: string;
  specs?: SpecRow[];
  showClassComparison?: boolean;
  footnote?: string;
  /** 
   * Pass Stripe product metadata to auto-generate specs from spec_* keys.
   * Takes precedence over `specs` array if provided.
   */
  metadata?: Record<string, string | undefined>;
  /** Pro tip from metadata to display at bottom */
  proTip?: string;
}

/**
 * TechnicalSpecsTable Component
 * 
 * SEO-optimized technical specifications table component that provides
 * detailed product information for improved Information Gain and E-E-A-T signals.
 * 
 * Includes:
 * - Responsive design for mobile/desktop
 * - Class comparison mode (II/III/IV) for forks
 * - Single-value mode for modules/chargers
 * - Structured data support
 */
/**
 * Extract spec_* keys from metadata and convert to SpecRow format
 */
function extractSpecsFromMetadata(metadata: Record<string, string | undefined>): SpecRow[] {
  const specs: SpecRow[] = [];
  
  // Define friendly labels for common spec keys
  const labelMap: Record<string, string> = {
    spec_thermal_torque: 'IGBT Mounting Torque',
    spec_input_fuse: 'Input Fuse (F1)',
    spec_output_fuse: 'Output Fuse (F2)',
    spec_igbt_mounting: 'IGBT Mounting Pattern',
    spec_thermal_pad: 'Thermal Pad Spec',
    spec_operating_temp: 'Operating Temperature',
    spec_input_voltage: 'Input Voltage',
    spec_output_voltage: 'Output Voltage',
    spec_output_current: 'Max Output Current',
    spec_output_power: 'Output Power',
    spec_efficiency: 'Efficiency Rating',
    spec_communication: 'Communication Protocol',
    spec_cooling: 'Cooling System',
    spec_ingress: 'Ingress Protection',
    spec_usb_port: 'USB Port',
    spec_display: 'Display Type',
    spec_mounting: 'Mounting',
    spec_power_factor: 'Power Factor',
    // Phase 4 additions
    spec_charging_curve: 'Charging Algorithm',
    spec_dip_switch: '⚙️ Configuration', // Special icon for configuration
  };

  // Define note hints for certain spec types
  const noteMap: Record<string, string> = {
    spec_dip_switch: 'Set before installation',
    spec_charging_curve: 'Battery chemistry dependent',
  };

  for (const [key, value] of Object.entries(metadata)) {
    if (key.startsWith('spec_') && value) {
      const label = labelMap[key] || key
        .replace('spec_', '')
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      specs.push({ 
        label, 
        value,
        note: noteMap[key],
      });
    }
  }

  return specs;
}

export default function TechnicalSpecsTable({ 
  title, 
  specs: providedSpecs, 
  showClassComparison = false,
  footnote,
  metadata,
  proTip,
}: TechnicalSpecsTableProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Use metadata-derived specs if provided, otherwise use providedSpecs
  const specs = useMemo(() => {
    if (metadata) {
      return extractSpecsFromMetadata(metadata);
    }
    return providedSpecs || [];
  }, [metadata, providedSpecs]);
  
  // Show first 5 rows collapsed, all when expanded
  const displayedSpecs = expanded ? specs : specs.slice(0, 5);
  const hasMoreSpecs = specs.length > 5;

  if (showClassComparison) {
    return (
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-sm text-slate-300 mt-1">ITA/ISO 2328 Compliant Specifications</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-900 border-b">Specification</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-900 border-b bg-blue-50">
                  <div className="text-blue-800">Class II</div>
                  <div className="text-xs text-blue-600 font-normal">(&lt;5,500 lbs)</div>
                </th>
                <th className="px-4 py-3 text-center font-semibold text-slate-900 border-b bg-green-50">
                  <div className="text-green-800">Class III</div>
                  <div className="text-xs text-green-600 font-normal">(5,500-10,999 lbs)</div>
                </th>
                <th className="px-4 py-3 text-center font-semibold text-slate-900 border-b bg-orange-50">
                  <div className="text-orange-800">Class IV</div>
                  <div className="text-xs text-orange-600 font-normal">(≥11,000 lbs)</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedSpecs.map((spec, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-4 py-3 font-medium text-slate-900 border-b">
                    {spec.label}
                    {spec.note && (
                      <span className="block text-xs text-slate-500 font-normal mt-0.5">{spec.note}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700 border-b bg-blue-50/30">
                    {spec.classII || '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700 border-b bg-green-50/30">
                    {spec.classIII || '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700 border-b bg-orange-50/30">
                    {spec.classIV || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {hasMoreSpecs && (
          <div className="px-6 py-4 bg-slate-50 border-t">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm font-medium text-canyon-rust hover:text-canyon-rust/80 transition-colors flex items-center gap-2"
            >
              {expanded ? 'Show Less' : `Show ${specs.length - 5} More Specifications`}
              <svg 
                className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
        
        {proTip && (
          <div className="px-6 py-4 bg-amber-50 border-t border-amber-200">
            <div className="flex items-start gap-3">
              <span className="text-amber-600 text-lg">💡</span>
              <div>
                <p className="text-sm font-semibold text-amber-800 mb-1">Pro Tip</p>
                <p className="text-sm text-amber-700">{proTip}</p>
              </div>
            </div>
          </div>
        )}
        
        {footnote && (
          <div className="px-6 py-3 bg-slate-100 border-t text-xs text-slate-600">
            {footnote}
          </div>
        )}
      </div>
    );
  }

  // Single-value mode (for charger modules, etc.)
  return (
    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4">
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {displayedSpecs.map((spec, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="px-6 py-4 font-medium text-slate-900 border-b w-1/2">
                  {spec.label}
                  {spec.note && (
                    <span className="block text-xs text-slate-500 font-normal mt-0.5">{spec.note}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-700 border-b">
                  {spec.value || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {hasMoreSpecs && (
        <div className="px-6 py-4 bg-slate-50 border-t">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-medium text-canyon-rust hover:text-canyon-rust/80 transition-colors flex items-center gap-2"
          >
            {expanded ? 'Show Less' : `Show ${specs.length - 5} More Specifications`}
            <svg 
              className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
      
      {proTip && (
        <div className="px-6 py-4 bg-amber-50 border-t border-amber-200">
          <div className="flex items-start gap-3">
            <span className="text-amber-600 text-lg">💡</span>
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1">Pro Tip</p>
              <p className="text-sm text-amber-700">{proTip}</p>
            </div>
          </div>
        </div>
      )}
      
      {footnote && (
        <div className="px-6 py-3 bg-slate-100 border-t text-xs text-slate-600">
          {footnote}
        </div>
      )}
    </div>
  );
}

// Pre-defined spec data for common products
export const FORK_SPECS: SpecRow[] = [
  { label: 'Mounting Height (A)', classII: '16" (406mm)', classIII: '20" (508mm)', classIV: '25" (635mm)' },
  { label: 'Hook Spacing (B)', classII: '4.5" (114mm)', classIII: '5.5" (140mm)', classIV: '7.0" (178mm)' },
  { label: 'Upper Hook Width', classII: '2.36" (60mm)', classIII: '2.95" (75mm)', classIV: '3.54" (90mm)' },
  { label: 'Lower Hook Width', classII: '2.36" (60mm)', classIII: '2.95" (75mm)', classIV: '3.54" (90mm)' },
  { label: 'Fork Section (T×W)', classII: '1.5"×4" to 2"×5"', classIII: '2"×5" to 2.5"×6"', classIV: '2.5"×6" to 3"×8"' },
  { label: 'Typical Capacity Range', classII: '2,000–5,500 lbs', classIII: '5,500–11,000 lbs', classIV: '11,000–20,000+ lbs' },
  { label: 'Standard Lengths', classII: '36"–48"', classIII: '42"–72"', classIV: '48"–96"' },
  { label: 'Material', classII: 'Alloy Steel', classIII: 'Alloy Steel', classIV: 'High-Strength Alloy' },
  { label: 'Heat Treatment', classII: 'Quench & Temper', classIII: 'Quench & Temper', classIV: 'Quench & Temper', note: 'Min yield strength: 825 MPa' },
  { label: 'Taper Style', classII: 'Full Taper / Blunt Taper', classIII: 'Full Taper / Blunt Taper', classIV: 'Full Taper / Blunt Taper' },
  { label: 'Safety Standard', classII: 'ANSI B56.1', classIII: 'ANSI B56.1', classIV: 'ANSI B56.1' },
  { label: 'ISO Compliance', classII: 'ISO 2328', classIII: 'ISO 2328', classIV: 'ISO 2328' },
];

export const CHARGER_MODULE_SPECS: SpecRow[] = [
  { label: 'Compatible Chargers', value: 'Enersys/Hawker Lifeplus, Lifespeed, EI Series' },
  { label: 'Part Numbers', value: '6LA20671, 6LA20671-00, 6LA20672' },
  { label: 'Input Voltage', value: '208-480 VAC, 3-Phase' },
  { label: 'Output Voltage Range', value: '12V–80V DC (Battery Dependent)' },
  { label: 'Maximum Output Current', value: 'Up to 220A (Model Dependent)' },
  { label: 'Power Rating', value: '3kW–18kW (Model Dependent)' },
  { label: 'Efficiency', value: '≥92% at Full Load' },
  { label: 'Cooling Method', value: 'Forced Air / Heat Sink' },
  { label: 'Communication Protocol', value: 'CAN Bus / RS-485' },
  { label: 'Display Interface', value: 'LED Indicators / Digital Display' },
  { label: 'Protection Features', value: 'Over-temp, Over-current, Reverse Polarity' },
  { label: 'Operating Temperature', value: '32°F–104°F (0°C–40°C)' },
  { label: 'Warranty', value: '6 Months (Remanufactured)' },
  { label: 'Certification', value: 'UL Listed, CE Marked' },
];

