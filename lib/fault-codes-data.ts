/**
 * Fault Codes Data for Equipment Models
 * Server-safe data export (no 'use client' directive)
 */

export interface FaultCode {
  code: string;
  name: string;
  description: string;
  causes: string[];
  solutions: string[];
  relatedParts?: {
    name: string;
    sku: string;
  }[];
  severity: 'low' | 'medium' | 'high';
}

export const FAULT_CODES_DATA: Record<string, Record<string, FaultCode[]>> = {
  genie: {
    'gs-1930': [
      {
        code: 'LL',
        name: 'Low Battery',
        description: 'The battery voltage has dropped below the minimum operating threshold. The machine will limit or disable platform operations to prevent deep discharge damage.',
        causes: [
          'Battery charge level below 20%',
          'Weak or aging battery cells',
          'Loose or corroded battery connections',
          'Excessive load or extended use between charges',
        ],
        solutions: [
          'Charge the battery immediately using an approved charger',
          'Check battery water levels (if applicable) and top off with distilled water',
          'Inspect and clean all battery terminal connections',
          'If error persists after charging, test individual cell voltages',
          'Consider battery replacement if cells show significant imbalance',
        ],
        relatedParts: [
          { name: 'Control Box Assembly', sku: '1256721GT' },
        ],
        severity: 'medium',
      },
      {
        code: 'ti',
        name: 'Platform Tilted',
        description: 'The tilt sensor has detected that the machine chassis is beyond the safe operating angle. This is a safety lockout to prevent tip-over.',
        causes: [
          'Machine positioned on uneven ground',
          'Overloaded platform causing chassis deflection',
          'Tilt sensor calibration drift',
          'Damaged or faulty tilt sensor',
        ],
        solutions: [
          'Move the machine to level ground and reset',
          'Verify load does not exceed platform capacity',
          'Check tilt sensor mounting and wiring connections',
          'Recalibrate tilt sensor per service manual procedure',
          'Replace tilt sensor if calibration fails',
        ],
        relatedParts: [
          { name: 'Limit Switch Assembly', sku: 'GEN-105122LS' },
        ],
        severity: 'high',
      },
    ],
    'gs-1932': [
      {
        code: 'LL',
        name: 'Low Battery',
        description: 'The battery voltage has dropped below the minimum operating threshold. The machine will limit or disable platform operations to prevent deep discharge damage.',
        causes: [
          'Battery charge level below 20%',
          'Weak or aging battery cells',
          'Loose or corroded battery connections',
          'Excessive load or extended use between charges',
        ],
        solutions: [
          'Charge the battery immediately using an approved charger',
          'Check battery water levels (if applicable) and top off with distilled water',
          'Inspect and clean all battery terminal connections',
          'If error persists after charging, test individual cell voltages',
          'Consider battery replacement if cells show significant imbalance',
        ],
        relatedParts: [
          { name: 'Control Box Assembly', sku: '1256721GT' },
        ],
        severity: 'medium',
      },
      {
        code: 'ti',
        name: 'Platform Tilted',
        description: 'The tilt sensor has detected that the machine chassis is beyond the safe operating angle. This is a safety lockout to prevent tip-over.',
        causes: [
          'Machine positioned on uneven ground',
          'Overloaded platform causing chassis deflection',
          'Tilt sensor calibration drift',
          'Damaged or faulty tilt sensor',
        ],
        solutions: [
          'Move the machine to level ground and reset',
          'Verify load does not exceed platform capacity',
          'Check tilt sensor mounting and wiring connections',
          'Recalibrate tilt sensor per service manual procedure',
          'Replace tilt sensor if calibration fails',
        ],
        relatedParts: [
          { name: 'Limit Switch Assembly', sku: 'GEN-105122LS' },
        ],
        severity: 'high',
      },
    ],
  },
  toyota: {
    '8fbcu25': [
      {
        code: 'A5-1',
        name: 'Charger Communication Error',
        description: 'The onboard battery management system cannot communicate with the charger. This prevents proper charging and may indicate a charger or BMS fault.',
        causes: [
          'Charger not properly connected to the battery',
          'Damaged or corroded charging connector pins',
          'CAN bus communication failure between charger and BMS',
          'Charger firmware incompatibility',
          'Faulty onboard charger interlock circuit',
        ],
        solutions: [
          'Disconnect and reconnect the charger, ensuring full seat of connector',
          'Inspect charging port pins for damage or corrosion',
          'Verify charger is compatible with the battery voltage (36V/48V)',
          'Check CAN bus wiring for breaks or shorts',
          'Try a different known-good charger to isolate the issue',
          'Contact Toyota service for BMS diagnostics if issue persists',
        ],
        relatedParts: [
          { name: 'Hydraulic Filter', sku: '67502-23000-71' },
        ],
        severity: 'medium',
      },
      {
        code: 'E5-1',
        name: 'Controller Communication Error',
        description: 'The main controller has lost communication with one or more vehicle modules. This can affect drive, lift, or steering functions.',
        causes: [
          'Loose or damaged CAN bus wiring harness',
          'Failed controller module (drive, pump, or steering)',
          'Power supply issue to control modules',
          'Water intrusion in electrical compartment',
          'EMI interference from external source',
        ],
        solutions: [
          'Check all CAN bus connector pins and wiring for damage',
          'Verify 12V auxiliary power supply to controllers',
          'Inspect control compartment for water or moisture damage',
          'Use Toyota diagnostic tool to identify which module is offline',
          'Reset controllers by disconnecting battery for 30 seconds',
          'Replace faulty controller module if identified',
        ],
        relatedParts: [
          { name: 'Brake Shoe Set', sku: '04476-30020-71' },
          { name: 'Head Lamp 48V', sku: '56510-11900-71' },
        ],
        severity: 'high',
      },
    ],
  },
};

// Helper function to get fault codes for a specific brand/model
export function getFaultCodesForModel(brandSlug: string, modelSlug: string): FaultCode[] {
  const brandCodes = FAULT_CODES_DATA[brandSlug.toLowerCase()];
  if (!brandCodes) return [];
  
  return brandCodes[modelSlug.toLowerCase()] || [];
}

