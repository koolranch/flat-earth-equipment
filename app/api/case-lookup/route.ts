import { NextResponse } from "next/server";

function clean(s: string): string {
  return (s || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// VIN Year codes (position 10)
const YEAR_CODES: Record<string, number> = {
  'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014,
  'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
  'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024,
  'S': 2025, 'T': 2026, 'V': 2027, 'W': 2028, 'X': 2029,
  'Y': 2030,
  // Earlier years cycle back
  '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005,
  '6': 2006, '7': 2007, '8': 2008, '9': 2009,
};

// Manufacturing plant codes (position 11)
const PLANT_CODES: Record<string, string> = {
  'A': 'Racine, Wisconsin, USA',
  'B': 'Burlington, Iowa, USA',
  'C': 'Wichita, Kansas, USA',
  'D': 'East Moline, Illinois, USA',
  'E': 'St. Nazianz, Wisconsin, USA',
  'F': 'Fargo, North Dakota, USA',
  'G': 'Grand Island, Nebraska, USA',
  'H': 'Goodfield, Illinois, USA',
  'J': 'Japan (Sumitomo)',
  'K': 'Korea (Hyundai)',
  'L': 'Lecce, Italy',
  'M': 'Modena, Italy',
  'N': 'San Mauro, Italy',
  'P': 'Plock, Poland',
  'R': 'Racine, Wisconsin, USA (Alt)',
  'S': 'St. Valentin, Austria',
  'T': 'Turin, Italy',
  'U': 'USA (General)',
  'W': 'Wichita, Kansas, USA (Alt)',
  'X': 'Export Assembly',
  'Y': 'Curitiba, Brazil',
  'Z': 'Jesi, Italy',
};

// Manufacturer identifier codes (positions 1-3)
const MANUFACTURER_CODES: Record<string, string> = {
  'YDH': 'CNH Industrial / Case Construction',
  'YDJ': 'CNH Industrial / Case IH',
  'YDK': 'CNH Industrial / New Holland',
  'JAF': 'Case Construction Equipment',
  'JJA': 'Case IH (Magnum Series)',
  'JJE': 'Case IH (CX/Maxxum Series)',
  'JJF': 'Case IH (5100-5200 Series)',
  'HFJ': 'Case IH (JX Series)',
  'CGK': 'Case Construction',
};

// Legacy prefix patterns for year determination
const LEGACY_PREFIXES: Record<string, { era: string; years: string }> = {
  'JJE': { era: 'Late 1990s–2000s', years: 'CX and Maxxum Series' },
  'JJF': { era: 'Early 1990s', years: '5100–5200 Series' },
  'JJA': { era: 'Late 1980s–1990s', years: 'Magnum Series' },
  'HFJ': { era: 'Early 2000s', years: 'JX Series Compact Tractors' },
  'N4C': { era: '2004', years: '2004 Production' },
  'N5C': { era: '2005', years: '2005 Production' },
  'N6C': { era: '2006', years: '2006 Production' },
  'N7C': { era: '2007', years: '2007 Production' },
  'N8C': { era: '2008', years: '2008 Production' },
  'N9C': { era: '2009', years: '2009 Production' },
};

// Serial plate locations by equipment type
const PLATE_LOCATIONS: Record<string, string[]> = {
  'backhoe': [
    'Near the front axle beam or riveted to the front bolster',
    'Left side of dash just inside left door of cab (older 580B, C & D models)',
    'On the frame under the left door',
    'On the right-hand frame rail below the cab entry step',
  ],
  'excavator': [
    'Right side of the main body near the operator\'s cab',
    'Behind the boom cylinder on the upper structure',
    'On the cab plate near the operator seat or door jamb',
  ],
  'skid steer': [
    'Inside the cab door frame',
    'On the left lift arm plate',
    'On the main frame near the operator\'s station',
  ],
  'loader': [
    'On the chassis frame near the transmission crossmember',
    'Embossed on the right-hand frame rail below cab entry step',
    'Near the front axle on the main frame',
  ],
  'dozer': [
    'Front frame near the hydraulic pump',
    'Rear cross member of the main frame',
    'On the track frame near the sprocket',
  ],
  'tractor': [
    'Below the steering column',
    'On the transmission housing',
    'Right-hand side of the chassis frame',
    'Near the front axle support',
  ],
  'default': [
    'On the main frame rail, typically right side',
    'Near the operator\'s station or cab door jamb',
    'On the chassis frame near the transmission',
    'Check engine block for separate engine serial number',
  ],
};

function getPlateLocations(equipmentType: string | null): string[] {
  if (!equipmentType) return PLATE_LOCATIONS['default'];
  
  const type = equipmentType.toLowerCase();
  if (type.includes('backhoe') || type.includes('580')) return PLATE_LOCATIONS['backhoe'];
  if (type.includes('excavator') || type.includes('cx')) return PLATE_LOCATIONS['excavator'];
  if (type.includes('skid') || type.includes('sr') || type.includes('sv')) return PLATE_LOCATIONS['skid steer'];
  if (type.includes('loader') || type.includes('wheel')) return PLATE_LOCATIONS['loader'];
  if (type.includes('dozer') || type.includes('crawler')) return PLATE_LOCATIONS['dozer'];
  if (type.includes('tractor')) return PLATE_LOCATIONS['tractor'];
  
  return PLATE_LOCATIONS['default'];
}

function decodeVIN(serial: string) {
  const cleaned = clean(serial);
  
  // Modern 17-character VIN format
  if (cleaned.length === 17) {
    const mfrCode = cleaned.slice(0, 3);
    const descriptor = cleaned.slice(3, 8);
    const checkDigit = cleaned[8];
    const yearCode = cleaned[9];
    const plantCode = cleaned[10];
    const sequence = cleaned.slice(11);
    
    return {
      manufacturer: MANUFACTURER_CODES[mfrCode] || `CNH Industrial (${mfrCode})`,
      productLine: descriptor,
      yearCode,
      yearValue: YEAR_CODES[yearCode] || null,
      plantCode,
      plantName: PLANT_CODES[plantCode] || `Unknown Plant (${plantCode})`,
      sequenceNumber: sequence,
      era: null,
      prefix: mfrCode,
    };
  }
  
  // Check for legacy prefix patterns
  const prefix3 = cleaned.slice(0, 3);
  const legacyMatch = LEGACY_PREFIXES[prefix3];
  
  if (legacyMatch) {
    // Extract year from NxC pattern (e.g., N5C = 2005)
    let yearValue: number | null = null;
    if (prefix3.match(/N\dC/)) {
      const digit = parseInt(prefix3[1]);
      yearValue = 2000 + digit;
    }
    
    return {
      manufacturer: 'Case / CNH Industrial',
      productLine: null,
      yearCode: null,
      yearValue,
      plantCode: null,
      plantName: null,
      sequenceNumber: cleaned.slice(3),
      era: legacyMatch.era,
      prefix: prefix3,
    };
  }
  
  // For shorter serials, try to extract what we can
  return {
    manufacturer: 'Case / CNH Industrial',
    productLine: null,
    yearCode: null,
    yearValue: null,
    plantCode: null,
    plantName: null,
    sequenceNumber: cleaned,
    era: null,
    prefix: null,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const serial = clean(body.serial || "");
    const model = body.model ? body.model.trim().toUpperCase() : null;
    const equipmentType = body.equipmentType || null;

    if (!serial) {
      return NextResponse.json({ error: "Missing serial number" }, { status: 400 });
    }

    const decoded = decodeVIN(serial);
    const plateLocations = getPlateLocations(equipmentType);
    
    const notes: string[] = [];
    
    if (serial.length === 17) {
      notes.push('This appears to be a modern 17-character VIN/PIN following ISO standards.');
    } else if (serial.length < 10) {
      notes.push('This appears to be a shorter legacy serial number. Year determination may require a lookup table for your specific model.');
    }
    
    if (decoded.era) {
      notes.push(`Based on the prefix "${decoded.prefix}", this equipment is from the ${decoded.era} era.`);
    }
    
    if (decoded.plantName && decoded.plantName.includes('Japan')) {
      notes.push('Equipment manufactured in Japan was typically built by Sumitomo for Case.');
    }
    
    if (model) {
      if (model.includes('580')) {
        notes.push('The 580 series is Case\'s legendary backhoe loader line, in production since 1966.');
      } else if (model.includes('CX')) {
        notes.push('CX series excavators are manufactured through Case\'s partnership with Sumitomo.');
      } else if (model.includes('SR') || model.includes('SV')) {
        notes.push('SR/SV series are Case\'s skid steer and compact track loader lines.');
      }
    }
    
    notes.push('For definitive year and specification data, contact your local Case dealer or use the official parts lookup tool.');

    return NextResponse.json({
      input: { serial, model, equipmentType },
      decoded,
      plateLocations,
      officialLookupUrl: 'https://www.casece.com/northamerica/en-us/parts-and-service',
      notes,
    });
  } catch (error) {
    console.error("Case lookup error:", error);
    return NextResponse.json({ error: "Failed to decode serial number" }, { status: 500 });
  }
}
