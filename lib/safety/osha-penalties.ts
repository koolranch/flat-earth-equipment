/** Federal OSHA maximum civil penalties effective Jan 15, 2025. Source: https://www.osha.gov/penalties */
export const FEDERAL_OSHA_PENALTIES_2025 = {
  effectiveDate: '2025-01-15',
  min: 0,
  seriousMax: 16_550,
  willfulMax: 165_514,
} as const;

export type StateOshaFines = {
  min: number;
  seriousMax: number;
  willfulMax: number;
};

export function getDefaultStateFines(): StateOshaFines {
  return {
    min: FEDERAL_OSHA_PENALTIES_2025.min,
    seriousMax: FEDERAL_OSHA_PENALTIES_2025.seriousMax,
    willfulMax: FEDERAL_OSHA_PENALTIES_2025.willfulMax,
  };
}
