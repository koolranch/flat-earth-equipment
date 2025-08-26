export type Canon = { serial?: string; faults?: string; guide?: string };

// Map legacy canonicals per brand when they exist; otherwise default to the new brand subroutes.
// Keep this tiny and additive.
export const brandCanonMap: Record<string, Canon> = {
  toyota: { serial: '/toyota-forklift-serial-lookup' },
  hyster: { serial: '/rental/forklifts/hyster-serial-number-lookup' },
  genie: { serial: '/genie-serial-number-lookup' },
  jlg: {},
  jcb: {},
  // Construction brands - preserve legacy rankings
  bobcat: { serial: '/parts/construction-equipment-parts/your-bobcat-serial-number-how-to-find-and-use-it' },
  case: { serial: '/case-serial-number-lookup' },
  'new-holland': { serial: '/parts/construction-equipment-parts/new-holland-skid-steer-serial-number-lookup' },
  kubota: { serial: '/kubota-serial-number-lookup' },
  takeuchi: { serial: '/takeuchi-serial-number-lookup' },
};

export function resolveCanonical(slug: string, tab: 'serial'|'fault-codes'|'guide'){
  const m = brandCanonMap[slug] || {};
  if (tab === 'serial') return m.serial || `/brand/${slug}/serial-lookup`;
  if (tab === 'fault-codes') return m.faults || `/brand/${slug}/fault-codes`;
  return m.guide || `/brand/${slug}/guide`;
}

// Utility function for consistent brand URLs across the hub
export function canonForBrand(slug: string) {
  const m = brandCanonMap[slug] || {};
  return {
    serial: m.serial || `/brand/${slug}/serial-lookup`,
    faults: m.faults || `/brand/${slug}/fault-codes`, 
    guide: m.guide || `/brand/${slug}/guide`
  };
}
