export interface StateData {
  name: string;
  abbreviation: string;
  operatorsCertified: string;
  majorCities: string[];
  keyIndustries: string[];
}

/**
 * Active ad campaign states with full data for hero personalization.
 * Structure is ready for all 50 states — just add entries below.
 */
export const stateData: Record<string, StateData> = {
  texas: {
    name: "Texas",
    abbreviation: "TX",
    operatorsCertified: "2,400+",
    majorCities: ["Dallas-Fort Worth", "Houston", "San Antonio", "Austin"],
    keyIndustries: ["Energy & Oil/Gas", "Logistics & Distribution", "Manufacturing"],
  },
  florida: {
    name: "Florida",
    abbreviation: "FL",
    operatorsCertified: "1,800+",
    majorCities: ["Miami", "Orlando", "Tampa", "Jacksonville"],
    keyIndustries: ["Logistics & Distribution", "Agriculture", "Tourism & Hospitality"],
  },
  arizona: {
    name: "Arizona",
    abbreviation: "AZ",
    operatorsCertified: "1,200+",
    majorCities: ["Phoenix", "Tucson", "Mesa", "Chandler"],
    keyIndustries: ["Manufacturing", "Logistics & Distribution", "Construction"],
  },
  ohio: {
    name: "Ohio",
    abbreviation: "OH",
    operatorsCertified: "1,500+",
    majorCities: ["Columbus", "Cleveland", "Cincinnati", "Toledo"],
    keyIndustries: ["Manufacturing", "Logistics & Distribution", "Automotive"],
  },
  indiana: {
    name: "Indiana",
    abbreviation: "IN",
    operatorsCertified: "900+",
    majorCities: ["Indianapolis", "Fort Wayne", "Evansville", "South Bend"],
    keyIndustries: ["Manufacturing", "Logistics & Distribution", "Automotive"],
  },
  pennsylvania: {
    name: "Pennsylvania",
    abbreviation: "PA",
    operatorsCertified: "1,600+",
    majorCities: ["Philadelphia", "Pittsburgh", "Allentown", "Erie"],
    keyIndustries: ["Manufacturing", "Logistics & Distribution", "Energy"],
  },
};

/**
 * All 50 US states (lowercase keys) for URL parameter validation.
 * Only states present in `stateData` above get personalized content;
 * the rest pass validation but fall back to generic.
 */
export const validStates = new Set([
  "alabama", "alaska", "arizona", "arkansas", "california",
  "colorado", "connecticut", "delaware", "florida", "georgia",
  "hawaii", "idaho", "illinois", "indiana", "iowa",
  "kansas", "kentucky", "louisiana", "maine", "maryland",
  "massachusetts", "michigan", "minnesota", "mississippi", "missouri",
  "montana", "nebraska", "nevada", "new hampshire", "new jersey",
  "new mexico", "new york", "north carolina", "north dakota", "ohio",
  "oklahoma", "oregon", "pennsylvania", "rhode island", "south carolina",
  "south dakota", "tennessee", "texas", "utah", "vermont",
  "virginia", "washington", "west virginia", "wisconsin", "wyoming",
]);

/**
 * Look up personalization data for a state URL param.
 * Returns null if the param is missing, invalid, or we don't have data yet.
 */
export function getStateFromParam(raw: string | null): StateData | null {
  if (!raw) return null;
  const key = raw.toLowerCase().trim();
  if (!validStates.has(key)) return null;
  return stateData[key] ?? null;
}
