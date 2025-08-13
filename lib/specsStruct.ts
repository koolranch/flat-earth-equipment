export type Specs = { 
  voltage?: number|null; 
  amperage?: number|null; 
  phase?: '1P'|'3P'|null; 
  family?: string|null 
};

/**
 * Enhanced parsing from text fields (slug, name, description)
 * Used as fallback when structured fields are missing
 */
export function parseFromText(slug: string, name?: string, description?: string): Specs {
  const text = `${slug||''} ${name||''} ${description||''}`.toLowerCase();
  
  // Enhanced voltage matching (including 96V for some models)
  const v = text.match(/\b(24|36|48|80|96)\s*v\b/);
  
  // Enhanced amperage matching with various amp formats
  const a = text.match(/\b(\d{2,3})\s*a(mps?|mp|mpere|mpers)?\b/);
  
  // Family detection for phase inference
  const fam = text.match(/green(2|4|6|8|x)\b/);
  const family = fam ? `green${fam[1]}` : null;
  
  // Phase inference from family
  let phase: '1P'|'3P'|null = null;
  if (family === 'green2' || family === 'green4') {
    phase = '1P';
  }
  if (family === 'green6' || family === 'green8' || family === 'greenx') {
    phase = '3P';
  }
  
  return { 
    voltage: v ? Number(v[1]) : null, 
    amperage: a ? Number(a[1]) : null, 
    phase, 
    family 
  };
}

/**
 * Get specs with preference for structured fields, fallback to parsing
 */
export function getSpecs(
  structuredVoltage?: number|null,
  structuredAmperage?: number|null, 
  structuredPhase?: string|null,
  slug?: string,
  name?: string,
  description?: string
): Specs {
  // If we have all structured fields, use them
  if (structuredVoltage && structuredAmperage && structuredPhase) {
    return {
      voltage: structuredVoltage,
      amperage: structuredAmperage,
      phase: structuredPhase as '1P'|'3P',
      family: null // Could derive from slug if needed
    };
  }
  
  // Parse text for missing fields
  const parsed = parseFromText(slug || '', name, description);
  
  return {
    voltage: structuredVoltage ?? parsed.voltage,
    amperage: structuredAmperage ?? parsed.amperage,
    phase: (structuredPhase as '1P'|'3P') ?? parsed.phase,
    family: parsed.family
  };
}

/**
 * Utility to check if specs are complete for recommendations
 */
export function isSpecsComplete(specs: Specs): boolean {
  return !!(specs.voltage && specs.amperage);
}
