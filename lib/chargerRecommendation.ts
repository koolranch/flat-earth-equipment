/**
 * Advanced Battery Charger Recommendation System
 * 
 * Features:
 * - Weighted scoring algorithm for ranking matches
 * - Fallback recommendations when no perfect match
 * - Comprehensive diagnostic logging
 * - Support for both parsed and structured data
 */

import { parseChargerSpecs, type BatteryCharger } from './batteryChargers';

export type BatteryRequirements = {
  voltage: number;           // Required DC voltage (24, 36, 48, 80)
  ampHours: number;         // Battery capacity in Ah
  chemistry: 'Lead-Acid' | 'AGM' | 'Lithium';  // Battery chemistry
  chargeTime: 'overnight' | 'fast';  // Desired charge time
  inputPhase?: '1P' | '3P'; // Available facility power
  preferQuickShip?: boolean; // Prefer quick-shipping options
};

export type ChargerMatch = {
  charger: BatteryCharger;
  score: number;
  reasons: string[];
  warnings: string[];
  specs: {
    voltage: number | null;
    current: number | null;
    phase: '1P' | '3P' | 'unknown';
    chemistry: string[];
    isQuickShip: boolean;
  };
};

export type RecommendationResult = {
  matches: ChargerMatch[];
  fallbacks: ChargerMatch[];
  diagnostics: {
    totalChargers: number;
    filteredChargers: number;
    scoringBreakdown: Record<string, number>;
    searchParams: BatteryRequirements;
  };
};

// Scoring weights for recommendation algorithm
const SCORING_WEIGHTS = {
  VOLTAGE_EXACT_MATCH: 100,     // Must match exactly
  VOLTAGE_MISMATCH_PENALTY: -1000, // Heavy penalty for wrong voltage
  
  CURRENT_OPTIMAL: 50,          // Current within optimal range
  CURRENT_ACCEPTABLE: 25,       // Current within acceptable range  
  CURRENT_SUBOPTIMAL: 10,       // Current outside preferred range
  
  CHEMISTRY_PERFECT_MATCH: 30,  // Exact chemistry match
  CHEMISTRY_COMPATIBLE: 15,     // Compatible chemistry
  CHEMISTRY_UNKNOWN: 5,         // Unknown chemistry (assumed compatible)
  
  PHASE_MATCH: 20,              // Input phase matches requirement
  PHASE_COMPATIBLE: 10,         // Input phase is compatible
  PHASE_UNKNOWN: 5,             // Unknown phase
  
  QUICK_SHIP_BONUS: 15,         // Quick ship when preferred
  BRAND_REPUTATION: 10,         // Trusted brand bonus
} as const;

/**
 * Calculate recommended amperage based on battery requirements
 */
function calculateRecommendedCurrent(requirements: BatteryRequirements): { min: number; max: number; optimal: number } {
  const { ampHours, chargeTime } = requirements;
  
  // Standard C-rate calculations
  const cRateMultiplier = chargeTime === 'overnight' ? 0.1 : 0.2; // C/10 for overnight, C/5 for fast
  const optimal = Math.round(ampHours * cRateMultiplier);
  
  // Allow ±15% tolerance around optimal
  const tolerance = 0.15;
  const min = Math.round(optimal * (1 - tolerance));
  const max = Math.round(optimal * (1 + tolerance));
  
  return { min, max, optimal };
}

/**
 * Extract charger specifications with fallback to database fields
 */
function getChargerSpecs(charger: BatteryCharger): ChargerMatch['specs'] {
  // Try to use structured database fields first
  const hasStructuredData = 'dc_voltage_v' in charger && 'dc_current_a' in charger;
  
  if (hasStructuredData && (charger as any).dc_voltage_v && (charger as any).dc_current_a) {
    return {
      voltage: (charger as any).dc_voltage_v,
      current: (charger as any).dc_current_a,
      phase: ((charger as any).input_phase as '1P' | '3P') || 'unknown',
      chemistry: (charger as any).chemistry_support || ['Lead-Acid', 'AGM'], // Default assumption
      isQuickShip: (charger as any).quick_ship || false,
    };
  }
  
  // Fallback to parsing from name/description
  const parsed = parseChargerSpecs(charger);
  return {
    voltage: parsed.voltage,
    current: parsed.current,
    phase: parsed.phase,
    chemistry: parsed.chemistry,
    isQuickShip: isQuickShipFromParsing(charger),
  };
}

/**
 * Determine quick ship status from charger data
 */
function isQuickShipFromParsing(charger: BatteryCharger): boolean {
  // If we have structured data, use it
  if ('quick_ship' in charger && (charger as any).quick_ship !== null) {
    return (charger as any).quick_ship;
  }
  
  // Fallback to parsing logic
  const slug = charger.slug.toLowerCase();
  const quickShipFamilies = ['green2', 'green4'];
  return quickShipFamilies.some(family => slug.includes(family));
}

/**
 * Score a charger against battery requirements
 */
function scoreCharger(charger: BatteryCharger, requirements: BatteryRequirements): ChargerMatch {
  const specs = getChargerSpecs(charger);
  const currentRange = calculateRecommendedCurrent(requirements);
  
  let score = 0;
  const reasons: string[] = [];
  const warnings: string[] = [];
  
  // Voltage scoring (critical - must match exactly)
  if (specs.voltage === requirements.voltage) {
    score += SCORING_WEIGHTS.VOLTAGE_EXACT_MATCH;
    reasons.push(`Exact voltage match (${specs.voltage}V)`);
  } else if (specs.voltage) {
    score += SCORING_WEIGHTS.VOLTAGE_MISMATCH_PENALTY;
    warnings.push(`Voltage mismatch: charger is ${specs.voltage}V, battery needs ${requirements.voltage}V`);
  } else {
    warnings.push('Voltage unknown - verify compatibility');
  }
  
  // Current (amperage) scoring
  if (specs.current) {
    if (specs.current >= currentRange.min && specs.current <= currentRange.max) {
      score += SCORING_WEIGHTS.CURRENT_OPTIMAL;
      reasons.push(`Optimal charging current (${specs.current}A for ${requirements.ampHours}Ah battery)`);
    } else if (specs.current >= currentRange.min * 0.8 && specs.current <= currentRange.max * 1.2) {
      score += SCORING_WEIGHTS.CURRENT_ACCEPTABLE;
      reasons.push(`Acceptable charging current (${specs.current}A)`);
    } else {
      score += SCORING_WEIGHTS.CURRENT_SUBOPTIMAL;
      if (specs.current < currentRange.min) {
        warnings.push(`Lower current than recommended (${specs.current}A vs ${currentRange.optimal}A optimal) - slower charging`);
      } else {
        warnings.push(`Higher current than recommended (${specs.current}A vs ${currentRange.optimal}A optimal) - check battery specs`);
      }
    }
  } else {
    warnings.push('Current rating unknown - verify amperage compatibility');
  }
  
  // Chemistry compatibility
  const chargerChemistries = specs.chemistry.map(c => c.toLowerCase());
  const requirementChemistry = requirements.chemistry.toLowerCase();
  
  if (chargerChemistries.some(c => c.includes(requirementChemistry.toLowerCase()))) {
    score += SCORING_WEIGHTS.CHEMISTRY_PERFECT_MATCH;
    reasons.push(`Supports ${requirements.chemistry} batteries`);
  } else if (chargerChemistries.length > 0) {
    // Lead-acid chargers usually work with AGM
    if (requirementChemistry === 'agm' && chargerChemistries.some(c => c.includes('lead'))) {
      score += SCORING_WEIGHTS.CHEMISTRY_COMPATIBLE;
      reasons.push('Compatible with AGM batteries (lead-acid charger)');
    } else {
      warnings.push(`Chemistry mismatch: charger supports [${specs.chemistry.join(', ')}], battery is ${requirements.chemistry}`);
    }
  } else {
    score += SCORING_WEIGHTS.CHEMISTRY_UNKNOWN;
    warnings.push('Chemistry compatibility unknown - verify with manufacturer');
  }
  
  // Input phase scoring
  if (requirements.inputPhase) {
    if (specs.phase === requirements.inputPhase) {
      score += SCORING_WEIGHTS.PHASE_MATCH;
      reasons.push(`Matches facility power (${specs.phase})`);
    } else if (specs.phase !== 'unknown') {
      warnings.push(`Phase mismatch: charger needs ${specs.phase}, facility has ${requirements.inputPhase}`);
    } else {
      score += SCORING_WEIGHTS.PHASE_UNKNOWN;
      warnings.push('Input phase unknown - verify electrical compatibility');
    }
  }
  
  // Quick ship bonus
  if (requirements.preferQuickShip && specs.isQuickShip) {
    score += SCORING_WEIGHTS.QUICK_SHIP_BONUS;
    reasons.push('Quick ship available');
  }
  
  // Brand reputation bonus
  if (charger.brand?.toLowerCase().includes('fsip') || charger.name.toLowerCase().includes('green')) {
    score += SCORING_WEIGHTS.BRAND_REPUTATION;
    reasons.push('Trusted brand');
  }
  
  return {
    charger,
    score,
    reasons,
    warnings,
    specs,
  };
}

/**
 * Main recommendation function
 */
export function recommendChargers(
  chargers: BatteryCharger[],
  requirements: BatteryRequirements,
  options: {
    maxResults?: number;
    minScore?: number;
    includeSuboptimal?: boolean;
    debugMode?: boolean;
  } = {}
): RecommendationResult {
  const {
    maxResults = 5,
    minScore = 50,
    includeSuboptimal = true,
    debugMode = false
  } = options;
  
  // Filter chargers by category if not already filtered
  const chargerCandidates = chargers.filter(c => 
    c.category_slug === 'battery-chargers' || 
    c.name?.toLowerCase().includes('charger')
  );
  
  // Score all chargers
  const scoredChargers = chargerCandidates.map(charger => 
    scoreCharger(charger, requirements)
  );
  
  // Separate good matches from fallbacks
  const goodMatches = scoredChargers
    .filter(match => match.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
  
  const fallbacks = includeSuboptimal ? scoredChargers
    .filter(match => match.score < minScore && match.score > -500) // Exclude major mismatches
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults) : [];
  
  // Generate diagnostics
  const scoringBreakdown = Object.entries(SCORING_WEIGHTS).reduce((acc, [key, weight]) => {
    acc[key] = weight;
    return acc;
  }, {} as Record<string, number>);
  
  const result: RecommendationResult = {
    matches: goodMatches,
    fallbacks,
    diagnostics: {
      totalChargers: chargers.length,
      filteredChargers: chargerCandidates.length,
      scoringBreakdown,
      searchParams: requirements,
    },
  };
  
  // Debug logging
  if (debugMode) {
    console.log('🔍 CHARGER RECOMMENDATION DEBUG');
    console.log('='.repeat(40));
    console.log('Requirements:', requirements);
    console.log(`Candidates: ${chargerCandidates.length}`);
    console.log(`Good matches: ${goodMatches.length}`);
    console.log(`Fallbacks: ${fallbacks.length}`);
    
    goodMatches.slice(0, 3).forEach((match, i) => {
      console.log(`\n${i + 1}. ${match.charger.name} (Score: ${match.score})`);
      console.log(`   Specs: ${match.specs.voltage}V ${match.specs.current}A ${match.specs.phase}`);
      console.log(`   Reasons: ${match.reasons.join(', ')}`);
      if (match.warnings.length > 0) {
        console.log(`   Warnings: ${match.warnings.join(', ')}`);
      }
    });
  }
  
  return result;
}

/**
 * Helper function to format recommendation results for display
 */
export function formatRecommendationSummary(result: RecommendationResult): string {
  const { matches, fallbacks, diagnostics } = result;
  const { voltage, ampHours, chargeTime } = diagnostics.searchParams;
  
  let summary = `Charger recommendations for ${voltage}V ${ampHours}Ah battery (${chargeTime} charging):\n\n`;
  
  if (matches.length > 0) {
    summary += `✅ ${matches.length} optimal match${matches.length !== 1 ? 'es' : ''} found:\n`;
    matches.slice(0, 3).forEach((match, i) => {
      summary += `${i + 1}. ${match.charger.name} - Score: ${match.score}\n`;
      summary += `   ${match.specs.voltage}V ${match.specs.current}A ${match.specs.phase}${match.specs.isQuickShip ? ' (Quick Ship)' : ''}\n`;
    });
  } else {
    summary += '⚠️  No optimal matches found.\n';
  }
  
  if (fallbacks.length > 0) {
    summary += `\n📋 ${fallbacks.length} alternative option${fallbacks.length !== 1 ? 's' : ''}:\n`;
    fallbacks.slice(0, 2).forEach((match, i) => {
      summary += `${i + 1}. ${match.charger.name} - Score: ${match.score}\n`;
      if (match.warnings.length > 0) {
        summary += `   ⚠️  ${match.warnings[0]}\n`;
      }
    });
  }
  
  return summary;
}
