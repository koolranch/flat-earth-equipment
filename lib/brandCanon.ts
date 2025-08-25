export type Canon = { serial?: string; faults?: string; guide?: string };

// Map legacy canonicals per brand when they exist; otherwise default to the new brand subroutes.
// Keep this tiny and additive.
export const brandCanonMap: Record<string, Canon> = {
  toyota: { serial: '/toyota-forklift-serial-lookup' },
  hyster: { serial: '/rental/forklifts/hyster-serial-number-lookup' },
  jlg: {},
  genie: {},
  jcb: {},
};

export function resolveCanonical(slug: string, tab: 'serial'|'fault-codes'|'guide'){
  const m = brandCanonMap[slug] || {};
  if (tab === 'serial') return m.serial || `/brand/${slug}/serial-lookup`;
  if (tab === 'fault-codes') return m.faults || `/brand/${slug}/fault-codes`;
  return m.guide || `/brand/${slug}/guide`;
}
