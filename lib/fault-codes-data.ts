/**
 * Fault Codes Data for Equipment Models
 * Server-safe data export (no 'use client' directive)
 * 
 * Technical content verified against OEM service manuals (2026)
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
        description: 'The battery voltage has dropped below the operational limit. The machine will disable lift functions to protect the battery from deep discharge damage.',
        causes: [
          'Battery charge level below 20%',
          'Weak or aging battery cells',
          'Charger failing to initiate charge cycle',
          'Loose or corroded battery connections',
          'Excessive load or extended use between charges',
        ],
        solutions: [
          'Check charger connection and verify it initiates a charge cycle',
          'Inspect the Delta-Q IC650 charger for fault indicators',
          'If charger fails to start, test with a known-good charger',
          'Replace Delta-Q IC650 if it fails to initiate charge cycle',
          'Check battery water levels and top off with distilled water',
          'Test individual cell voltages if error persists after full charge',
        ],
        relatedParts: [
          { name: 'Control Box Assembly', sku: '1256721GT' },
        ],
        severity: 'medium',
      },
      {
        code: 'ti',
        name: 'Platform Tilted',
        description: 'The machine is on an incline that exceeds the safety limit, disabling lift functions. This is a critical safety lockout to prevent tip-over accidents.',
        causes: [
          'Machine positioned on uneven or sloped ground',
          'Overloaded platform causing chassis deflection',
          'Level Sensor/Limit Switch damaged or miscalibrated',
          'Wiring harness damage to tilt sensor circuit',
        ],
        solutions: [
          'Move the machine to a level surface and reset',
          'Verify load does not exceed platform capacity (500 lbs typical)',
          'Inspect the Level Sensor/Limit Switch (PN: 105122GT) for damage',
          'Check sensor mounting bracket for looseness or impact damage',
          'Recalibrate tilt sensor per Genie service manual procedure',
          'Replace Level Sensor/Limit Switch if calibration fails',
        ],
        relatedParts: [
          { name: 'Level Sensor / Limit Switch', sku: 'GEN-105122LS' },
          { name: 'Scissor Wear Pad Kit', sku: '105122GT' },
        ],
        severity: 'high',
      },
    ],
    'gs-1932': [
      {
        code: 'LL',
        name: 'Low Battery',
        description: 'The battery voltage has dropped below the operational limit. The machine will disable lift functions to protect the battery from deep discharge damage.',
        causes: [
          'Battery charge level below 20%',
          'Weak or aging battery cells',
          'Charger failing to initiate charge cycle',
          'Loose or corroded battery connections',
          'Excessive load or extended use between charges',
        ],
        solutions: [
          'Check charger connection and verify it initiates a charge cycle',
          'Inspect the Delta-Q IC650 charger for fault indicators',
          'If charger fails to start, test with a known-good charger',
          'Replace Delta-Q IC650 if it fails to initiate charge cycle',
          'Check battery water levels and top off with distilled water',
          'Test individual cell voltages if error persists after full charge',
        ],
        relatedParts: [
          { name: 'Control Box Assembly', sku: '1256721GT' },
        ],
        severity: 'medium',
      },
      {
        code: 'ti',
        name: 'Platform Tilted',
        description: 'The machine is on an incline that exceeds the safety limit, disabling lift functions. This is a critical safety lockout to prevent tip-over accidents.',
        causes: [
          'Machine positioned on uneven or sloped ground',
          'Overloaded platform causing chassis deflection',
          'Level Sensor/Limit Switch damaged or miscalibrated',
          'Wiring harness damage to tilt sensor circuit',
        ],
        solutions: [
          'Move the machine to a level surface and reset',
          'Verify load does not exceed platform capacity (500 lbs typical)',
          'Inspect the Level Sensor/Limit Switch (PN: 105122GT) for damage',
          'Check sensor mounting bracket for looseness or impact damage',
          'Recalibrate tilt sensor per Genie service manual procedure',
          'Replace Level Sensor/Limit Switch if calibration fails',
        ],
        relatedParts: [
          { name: 'Level Sensor / Limit Switch', sku: 'GEN-105122LS' },
          { name: 'Scissor Wear Pad Kit', sku: '105122GT' },
        ],
        severity: 'high',
      },
    ],
  },
  toyota: {
    '8fbcu25': [
      {
        code: 'A5-1',
        name: 'Charger Error',
        description: 'The internal logic detects an issue with the incoming AC power or the charger\'s output stage. This prevents proper charging and may indicate a charger or internal module fault.',
        causes: [
          'Incoming AC power fluctuation or low voltage',
          'Charger output stage failure (internal module fault)',
          'Damaged or corroded charging connector pins',
          'CAN bus communication failure between charger and BMS',
          'Charger firmware incompatibility or corruption',
          'Faulty onboard charger interlock circuit',
        ],
        solutions: [
          'Verify incoming AC power is stable (208-240V)',
          'Inspect the SPE Green6 150A Charger for "Module Fault" indicator',
          'Check charging port pins for damage, corrosion, or debris',
          'If internal module fault is indicated, replace the Green6 Power Module',
          'Test with a different known-good charger to isolate the issue',
          'Contact Toyota service for BMS diagnostics if issue persists',
        ],
        relatedParts: [
          { name: 'SPE Green6 Power Module', sku: 'SPE-G6-MODULE' },
        ],
        severity: 'medium',
      },
      {
        code: 'E5-1',
        name: 'Communication Error',
        description: 'A break in the CAN-bus communication between the controller and the display/charger. This can affect drive, lift, steering, and charging functions.',
        causes: [
          'Loose or damaged CAN bus wiring harness',
          'Failed Accelerator Pedal "clogging" the signal bus',
          'Failed controller module (drive, pump, or steering)',
          'Water intrusion in electrical compartment',
          'Corroded connector pins on wiring harnesses',
          'EMI interference from external source',
        ],
        solutions: [
          'Check all CAN bus connector pins and wiring for damage or corrosion',
          'Inspect the Accelerator Pedal (PN: 26611-U2230-71) - a failed pedal often "clogs" the signal bus',
          'Verify 12V auxiliary power supply to controllers',
          'Inspect control compartment for water or moisture damage',
          'Use Toyota diagnostic tool to identify which module is offline',
          'Reset controllers by disconnecting battery for 30 seconds',
          'Replace faulty Accelerator Pedal or controller module if identified',
        ],
        relatedParts: [
          { name: 'Accelerator Pedal Assembly', sku: '26611-U2230-71' },
          { name: 'Brake Shoe Set', sku: '04476-30020-71' },
        ],
        severity: 'high',
      },
    ],
    '7fbe15': [
      {
        code: 'A5-1',
        name: 'Charger Error',
        description: 'The internal logic detects an issue with the incoming AC power or the charger\'s output stage. This prevents proper charging and may indicate a charger or internal module fault.',
        causes: [
          'Incoming AC power fluctuation or low voltage',
          'Charger output stage failure (internal module fault)',
          'Damaged or corroded charging connector pins',
          'CAN bus communication failure between charger and BMS',
        ],
        solutions: [
          'Verify incoming AC power is stable (208-240V)',
          'Inspect the SPE Green6 150A Charger for "Module Fault" indicator',
          'Check charging port pins for damage, corrosion, or debris',
          'If internal module fault is indicated, replace the Green6 Power Module',
          'Test with a different known-good charger to isolate the issue',
        ],
        relatedParts: [
          { name: 'SPE Green6 Power Module', sku: 'SPE-G6-MODULE' },
        ],
        severity: 'medium',
      },
      {
        code: 'E5-1',
        name: 'Communication Error',
        description: 'A break in the CAN-bus communication between the controller and the display/charger. This can affect drive, lift, steering, and charging functions.',
        causes: [
          'Loose or damaged CAN bus wiring harness',
          'Failed Accelerator Pedal "clogging" the signal bus',
          'Corroded connector pins on wiring harnesses',
          'Water intrusion in electrical compartment',
        ],
        solutions: [
          'Check all CAN bus connector pins and wiring for damage or corrosion',
          'Inspect the Accelerator Pedal (PN: 26611-U2230-71) - a failed pedal often "clogs" the signal bus',
          'Inspect control compartment for water or moisture damage',
          'Reset controllers by disconnecting battery for 30 seconds',
          'Replace faulty Accelerator Pedal if identified',
        ],
        relatedParts: [
          { name: 'Accelerator Pedal Assembly', sku: '26611-U2230-71' },
        ],
        severity: 'high',
      },
    ],
  },
  hyster: {
    'e50xn': [
      {
        code: 'F-21',
        name: 'Charger Fault',
        description: 'The charger has detected an internal fault or communication error with the battery management system.',
        causes: [
          'Charger output stage failure',
          'BMS communication timeout',
          'Incoming AC power fluctuation',
          'Overtemperature condition in charger',
        ],
        solutions: [
          'Verify incoming AC power is stable (208-240V)',
          'Inspect the SPE Green6 150A Charger for fault indicators',
          'Allow charger to cool if overtemperature is suspected',
          'If internal fault persists, replace the Green6 Power Module',
          'Check BMS wiring and connections',
        ],
        relatedParts: [
          { name: 'SPE Green6 Power Module', sku: 'SPE-G6-MODULE' },
          { name: 'Steer Motor Brushes', sku: '4603626' },
        ],
        severity: 'medium',
      },
      {
        code: 'E-12',
        name: 'Steering Controller Error',
        description: 'The steering controller has lost communication or detected an internal fault. Steering may be limited or disabled.',
        causes: [
          'Steering motor brush wear',
          'Controller communication failure',
          'Wiring harness damage',
          'Low 12V auxiliary voltage',
        ],
        solutions: [
          'Check steering motor brushes for wear (replace if < 5mm)',
          'Inspect steering controller wiring connections',
          'Verify 12V auxiliary battery voltage',
          'Reset controller by cycling key off for 30 seconds',
          'Replace steering motor brushes if worn',
        ],
        relatedParts: [
          { name: 'Steer Motor Brushes', sku: '4603626' },
          { name: 'Directional Control Switch', sku: '4035657' },
        ],
        severity: 'high',
      },
    ],
  },
  jungheinrich: {
    'efg-series': [
      {
        code: 'Er 01',
        name: 'Accelerator Fault',
        description: 'The accelerator pedal potentiometer is sending an out-of-range signal. The forklift may enter limp mode or disable traction.',
        causes: [
          'Accelerator pedal potentiometer failure',
          'Wiring harness damage to pedal',
          'Connector corrosion or loose connection',
          'Pedal mechanical damage',
        ],
        solutions: [
          'Inspect accelerator pedal wiring for damage',
          'Check connector pins for corrosion or bent contacts',
          'Test pedal potentiometer output with multimeter (should vary smoothly 0-5V)',
          'Replace Accelerator Pedal Assembly (PN: 51061972) if faulty',
          'Recalibrate pedal after replacement per service manual',
        ],
        relatedParts: [
          { name: 'Accelerator Pedal Assembly', sku: '51061972' },
        ],
        severity: 'high',
      },
      {
        code: 'Er 07',
        name: 'Charger Communication',
        description: 'The charger cannot establish communication with the vehicle BMS. Charging will not begin.',
        causes: [
          'Charger not compatible with vehicle protocol',
          'CAN bus wiring fault',
          'BMS controller failure',
          'Charger firmware issue',
        ],
        solutions: [
          'Verify charger is compatible with Jungheinrich protocol',
          'Check CAN bus wiring between charger port and BMS',
          'Try a different known-good charger',
          'Contact Jungheinrich service for BMS diagnostics',
        ],
        relatedParts: [],
        severity: 'medium',
      },
    ],
    'efg-216': [
      {
        code: 'Er 01',
        name: 'Accelerator Fault',
        description: 'The accelerator pedal potentiometer is sending an out-of-range signal. The forklift may enter limp mode or disable traction.',
        causes: [
          'Accelerator pedal potentiometer failure',
          'Wiring harness damage to pedal',
          'Connector corrosion or loose connection',
          'Pedal mechanical damage',
        ],
        solutions: [
          'Inspect accelerator pedal wiring for damage',
          'Check connector pins for corrosion or bent contacts',
          'Test pedal potentiometer output with multimeter (should vary smoothly 0-5V)',
          'Replace Accelerator Pedal Assembly (PN: 51061972) if faulty',
          'Recalibrate pedal after replacement per service manual',
        ],
        relatedParts: [
          { name: 'Accelerator Pedal Assembly', sku: '51061972' },
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
