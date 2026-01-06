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
  toro: {
    'dingo-tx-1000': [
      {
        code: 'NO CRANK',
        name: 'Engine Won\'t Crank',
        description: 'The engine does not crank when the start button is pressed. The starter motor does not engage. This is typically a safety interlock issue.',
        causes: [
          'Operator not seated (seat interlock open)',
          'Control handles not in neutral (handle interlock open)',
          'Seat switch failure or misadjustment',
          'Handle interlock switch failure',
          'Neutral safety switch failure',
          'Low battery voltage',
        ],
        solutions: [
          'Verify operator is seated firmly on the seat',
          'Ensure both control handles are in the neutral (centered) position',
          'Check seat switch wiring and mounting - adjust if seat is not fully depressing switch',
          'Test handle interlock switches for continuity when handles are centered',
          'Check battery voltage (should be 12.6V+ for starting)',
          'Bypass seat/handle switches temporarily to isolate faulty interlock',
          'Replace faulty interlock switch if identified',
        ],
        relatedParts: [
          { name: 'Hydraulic Filter', sku: '120-0255' },
          { name: 'Track Tensioner Assembly', sku: '131-4131' },
        ],
        severity: 'high',
      },
      {
        code: 'LOW HYD',
        name: 'Low Hydraulic Pressure',
        description: 'The hydraulic system is not generating sufficient pressure. Attachments may move slowly or not at all.',
        causes: [
          'Low hydraulic fluid level',
          'Clogged hydraulic filter',
          'Hydraulic pump wear or failure',
          'Internal leak in hydraulic system',
          'Relief valve stuck or misadjusted',
        ],
        solutions: [
          'Check hydraulic fluid level in reservoir - top off if low',
          'Replace hydraulic filter (PN: 120-0255) if overdue or clogged',
          'Check for external hydraulic leaks at hoses and fittings',
          'Test hydraulic pump pressure at test port',
          'Verify relief valve setting per service manual',
        ],
        relatedParts: [
          { name: 'Hydraulic Filter', sku: '120-0255' },
        ],
        severity: 'medium',
      },
    ],
    'dingo-tx-525': [
      {
        code: 'NO CRANK',
        name: 'Engine Won\'t Crank',
        description: 'The engine does not crank when the start button is pressed. The starter motor does not engage. This is typically a safety interlock issue.',
        causes: [
          'Operator not seated (seat interlock open)',
          'Control handles not in neutral (handle interlock open)',
          'Seat switch failure or misadjustment',
          'Handle interlock switch failure',
          'Low battery voltage',
        ],
        solutions: [
          'Verify operator is seated firmly on the seat',
          'Ensure both control handles are in the neutral (centered) position',
          'Check seat switch wiring and mounting',
          'Test handle interlock switches for continuity when handles are centered',
          'Check battery voltage (should be 12.6V+ for starting)',
          'Replace faulty interlock switch if identified',
        ],
        relatedParts: [
          { name: 'Hydraulic Filter', sku: '120-0255' },
        ],
        severity: 'high',
      },
    ],
    'dingo-tx-427': [
      {
        code: 'NO CRANK',
        name: 'Engine Won\'t Crank',
        description: 'The engine does not crank when the start button is pressed. The starter motor does not engage. This is typically a safety interlock issue.',
        causes: [
          'Operator not seated (seat interlock open)',
          'Control handles not in neutral (handle interlock open)',
          'Seat switch failure or misadjustment',
          'Handle interlock switch failure',
          'Low battery voltage',
        ],
        solutions: [
          'Verify operator is seated firmly on the seat',
          'Ensure both control handles are in the neutral (centered) position',
          'Check seat switch wiring and mounting',
          'Test handle interlock switches for continuity when handles are centered',
          'Check battery voltage (should be 12.6V+ for starting)',
          'Replace faulty interlock switch if identified',
        ],
        relatedParts: [
          { name: 'Hydraulic Filter', sku: '120-0255' },
        ],
        severity: 'high',
      },
    ],
  },
  jcb: {
    '507-42': [
      {
        code: 'TRANS DIS',
        name: 'Transmission Disconnect Error',
        description: 'The transmission has disengaged or the controller has detected a disconnect condition. The machine may not move or may be stuck in neutral.',
        causes: [
          'Neutral cutout switch failure or misadjustment',
          'Transmission controller communication fault',
          'Clutch pack pressure sensor issue',
          'Low transmission fluid level',
          'Wiring harness damage to transmission controller',
        ],
        solutions: [
          'Check the Neutral cutout switch for proper operation and adjustment',
          'Verify transmission fluid level - top off if low',
          'Inspect wiring to transmission controller for damage or corrosion',
          'Check clutch pack pressure with diagnostic tool',
          'Test neutral cutout switch continuity in all positions',
          'Replace neutral cutout switch if faulty',
        ],
        relatedParts: [
          { name: 'Engine Oil Filter', sku: '320/04133' },
          { name: 'Joystick Controller', sku: '332/K4645' },
        ],
        severity: 'high',
      },
      {
        code: 'ENG OIL',
        name: 'Engine Oil Pressure Low',
        description: 'The engine oil pressure has dropped below the safe operating threshold. Engine power may be reduced to protect internals.',
        causes: [
          'Low engine oil level',
          'Clogged oil filter',
          'Oil pressure sensor failure',
          'Oil pump wear',
          'Wrong oil viscosity for ambient temperature',
        ],
        solutions: [
          'Check engine oil level immediately - top off if low',
          'Replace engine oil filter (PN: 320/04133)',
          'Verify correct oil viscosity for operating conditions',
          'Test oil pressure at gauge port if available',
          'Check oil pressure sensor wiring and connector',
        ],
        relatedParts: [
          { name: 'Engine Oil Filter', sku: '320/04133' },
        ],
        severity: 'high',
      },
    ],
    '3ts-8t': [
      {
        code: 'TRANS DIS',
        name: 'Transmission Disconnect Error',
        description: 'The transmission has disengaged or the controller has detected a disconnect condition. The machine may not move.',
        causes: [
          'Neutral cutout switch failure',
          'Transmission controller fault',
          'Low transmission fluid',
          'Wiring harness issue',
        ],
        solutions: [
          'Check the Neutral cutout switch for proper operation',
          'Verify transmission fluid level',
          'Inspect wiring to transmission controller',
          'Replace neutral cutout switch if faulty',
        ],
        relatedParts: [
          { name: 'Engine Oil Filter', sku: '320/04133' },
        ],
        severity: 'high',
      },
    ],
    '19c-1': [
      {
        code: 'FUEL SYS',
        name: 'Fuel System Fault',
        description: 'The fuel system has detected an issue. The engine may run rough, lose power, or fail to start.',
        causes: [
          'Clogged fuel filter',
          'Air in fuel system',
          'Fuel pump failure',
          'Contaminated fuel',
          'Fuel injector issue',
        ],
        solutions: [
          'Replace fuel filter (PN: 32/925915) - primary troubleshooting step',
          'Bleed air from fuel system per service manual procedure',
          'Check fuel tank for water or contamination',
          'Verify fuel pump is priming (listen for pump sound at key-on)',
          'Inspect fuel lines for cracks or leaks',
        ],
        relatedParts: [
          { name: 'Fuel Filter', sku: '32/925915' },
          { name: 'Bucket Pin Kit', sku: 'JCB-PIN-01' },
        ],
        severity: 'medium',
      },
      {
        code: 'BUCKET',
        name: 'Bucket Attachment Loose',
        description: 'The bucket attachment pins may be worn, causing excessive play or safety concerns.',
        causes: [
          'Worn bucket pins',
          'Worn bushings in bucket ears',
          'Missing or broken pin retainers',
          'Impact damage to attachment point',
        ],
        solutions: [
          'Inspect bucket pins for wear (replace if grooved or undersized)',
          'Check bushings in bucket attachment ears',
          'Verify pin retainers are installed and secure',
          'Replace Bucket Pin Kit (PN: JCB-PIN-01) if wear is excessive',
          'Grease attachment points per maintenance schedule',
        ],
        relatedParts: [
          { name: 'Bucket Pin Kit', sku: 'JCB-PIN-01' },
        ],
        severity: 'medium',
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
