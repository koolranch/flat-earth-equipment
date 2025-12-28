import { NextResponse } from "next/server";

function clean(s: string): string {
  return (s || "").trim().toUpperCase();
}

// Genie equipment series prefixes
const SERIES_MAP: Record<string, string> = {
  'GS': 'Scissor Lift',
  'S': 'Telescopic Boom Lift',
  'Z': 'Articulating Boom Lift',
  'GTH': 'Telehandler',
  'AWP': 'Push-Around Vertical Mast Lift',
  'IWP': 'Industrial Work Platform',
  'DPL': 'Dual Platform Lift',
  'GR': 'Genie Runabout',
  'TZ': 'Trailer-Mounted Boom Lift',
  'TMZ': 'Trailer-Mounted Z-Boom',
  'TMS': 'Trailer-Mounted S-Boom',
  'QS': 'QuickStock Lift',
  'RL': 'Rough Terrain Lift',
  'SX': 'Super Series Scissor',
  'DC': 'DC Scissor',
  'GRC': 'Genie Runabout Contractor'
};

// Map of equipment types to their plate locations
const PLATE_LOCATIONS: Record<string, string[]> = {
  'Scissor Lift': [
    'Front frame member near the battery compartment',
    'Under the platform on the base frame',
    'Near the operator control panel (ground controls)',
    'Stamped on the main chassis frame if plate is missing'
  ],
  'Telescopic Boom Lift': [
    'Above the battery compartment',
    'On the turntable bearing housing (S60-65 models)',
    'Stamped on both sides of the bearing (L/R and R/F)',
    'Left rear frame member on older models'
  ],
  'Articulating Boom Lift': [
    'On the turntable or slewing ring area',
    'Near the engine compartment',
    'On the main boom structure near the base',
    'Frame stamped backup location on chassis rails'
  ],
  'Telehandler': [
    'On the main frame near the operator cab',
    'Inside the cab (CE models have additional labeling)',
    'Engine compartment wall',
    'Frame rails near the front axle'
  ],
  'Push-Around Vertical Mast Lift': [
    'On the mast base frame',
    'Near the battery compartment',
    'On the control panel housing',
    'Base platform frame'
  ],
  'Trailer-Mounted Boom Lift': [
    'On the trailer frame near the tongue',
    'Separate NHTSA plate (for highway compliance)',
    'Serial plate on the lift structure',
    'Stamped on the main boom base'
  ]
};

// Parse Genie model number (e.g., GS-1930 -> 19ft height, 30" width)
function parseModelNumber(model: string): { platformHeight: number; width: number } | null {
  const cleaned = clean(model).replace(/[^A-Z0-9]/g, '');
  
  // Pattern: GS1930, GS2632, GS3246, S60, S80, Z4525, etc.
  // For GS series: last 4 digits often mean HH WW (height in feet, width in inches)
  const gsMatch = cleaned.match(/GS(\d{2})(\d{2})/);
  if (gsMatch) {
    return {
      platformHeight: parseInt(gsMatch[1], 10),
      width: parseInt(gsMatch[2], 10)
    };
  }
  
  // For boom lifts like S-60, S-80, Z-45/25
  const boomMatch = cleaned.match(/^[SZ](\d{2,3})/);
  if (boomMatch) {
    return {
      platformHeight: parseInt(boomMatch[1], 10),
      width: 0 // Width not encoded in boom lift names
    };
  }
  
  return null;
}

// Parse Genie serial number (e.g., GS3205A-76000)
function parseSerialNumber(serial: string): {
  prefix: string | null;
  designRevision: string | null;
  sequenceNumber: string | null;
} {
  const cleaned = clean(serial).replace(/\s+/g, '');
  
  // Pattern: PREFIX + optional letter + hyphen + sequence number
  // Examples: GS3205A-76000, S4012D-15673, Z4525C-12345
  const match = cleaned.match(/^([A-Z]+\d+)([A-Z])?-?(\d+)?$/);
  
  if (match) {
    return {
      prefix: match[1] || null,
      designRevision: match[2] || null,
      sequenceNumber: match[3] || null
    };
  }
  
  // Try simpler pattern without letter
  const simpleMatch = cleaned.match(/^([A-Z]+\d+)-?(\d+)?$/);
  if (simpleMatch) {
    return {
      prefix: simpleMatch[1] || null,
      designRevision: null,
      sequenceNumber: simpleMatch[2] || null
    };
  }
  
  return {
    prefix: null,
    designRevision: null,
    sequenceNumber: null
  };
}

// Infer equipment family from serial or model
function inferEquipmentFamily(serial: string, model?: string): string | null {
  const combined = clean(`${model || ''} ${serial}`);
  
  // Check against known prefixes (longest first to avoid partial matches)
  const prefixes = Object.keys(SERIES_MAP).sort((a, b) => b.length - a.length);
  
  for (const prefix of prefixes) {
    if (combined.includes(prefix)) {
      return SERIES_MAP[prefix];
    }
  }
  
  // Try to match from the serial prefix
  const serialPrefix = combined.match(/^([A-Z]+)/)?.[1];
  if (serialPrefix && SERIES_MAP[serialPrefix]) {
    return SERIES_MAP[serialPrefix];
  }
  
  return null;
}

// Get the series prefix from serial/model
function getSeriesPrefix(serial: string, model?: string): string | null {
  const combined = clean(`${model || ''} ${serial}`);
  
  const prefixes = Object.keys(SERIES_MAP).sort((a, b) => b.length - a.length);
  
  for (const prefix of prefixes) {
    if (combined.includes(prefix)) {
      return prefix;
    }
  }
  
  return null;
}

export async function POST(req: Request) {
  try {
    const { serial, model, equipmentType } = await req.json();
    
    if (!serial) {
      return NextResponse.json({ error: "Missing serial number" }, { status: 400 });
    }
    
    const normalizedSerial = clean(serial);
    const normalizedModel = model ? clean(model) : null;
    
    // Parse the serial number
    const parsed = parseSerialNumber(normalizedSerial);
    
    // Infer equipment family
    let equipmentFamily = equipmentType || inferEquipmentFamily(normalizedSerial, normalizedModel || undefined);
    
    // Get series prefix
    const seriesPrefix = getSeriesPrefix(normalizedSerial, normalizedModel || undefined);
    
    // Parse model details if model provided
    let modelDetails = null;
    if (normalizedModel) {
      modelDetails = parseModelNumber(normalizedModel);
    }
    
    // Get plate locations based on equipment family
    let plateLocations: string[] = [];
    if (equipmentFamily) {
      // Find matching plate locations
      for (const [key, locations] of Object.entries(PLATE_LOCATIONS)) {
        if (equipmentFamily.toLowerCase().includes(key.toLowerCase()) || 
            key.toLowerCase().includes(equipmentFamily.toLowerCase().split(' ')[0])) {
          plateLocations = locations;
          break;
        }
      }
    }
    
    // If no specific locations found, provide generic guidance
    if (plateLocations.length === 0) {
      plateLocations = [
        'Check the main frame near the operator station',
        'Look for the data plate on the chassis or base frame',
        'The serial may be stamped directly on the frame if the plate is missing',
        'Consult the operator manual for your specific model'
      ];
    }
    
    // Build notes
    const notes: string[] = [];
    
    if (parsed.designRevision) {
      notes.push(`Design revision "${parsed.designRevision}" indicates a manufacturing update/modification series.`);
    }
    
    notes.push('Genie serial numbers use serial ranges (not encoded characters) to determine year of manufacture.');
    notes.push('For official year confirmation and parts lookup, use Genie Smart Parts at GoGenieLift.com.');
    
    if (modelDetails) {
      notes.push(`Model specifications decoded: ${modelDetails.platformHeight}' platform height${modelDetails.width ? `, ${modelDetails.width}" width` : ''}.`);
    }
    
    return NextResponse.json({
      input: {
        serial: normalizedSerial,
        model: normalizedModel,
        equipmentType: equipmentType || null
      },
      decoded: {
        equipmentFamily,
        modelDetails,
        designRevision: parsed.designRevision,
        sequenceNumber: parsed.sequenceNumber,
        prefix: parsed.prefix || seriesPrefix
      },
      plateLocations,
      officialLookupUrl: 'https://www.gogenieLift.com/',
      notes
    });
    
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

