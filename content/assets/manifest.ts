export type AssetMeta = { id: string; src: string; alt: string };

const A: Record<string, AssetMeta> = {
  A1_controls: { id: 'A1_controls', src: '/training/svg/A1_controls.svg', alt: 'Forklift controls diagram with labeled controls' },
  C1_ppe: { id: 'C1_ppe', src: '/training/svg/C1_ppe.svg', alt: 'PPE sprite: vest, hard hat, boots, goggles, earmuffs, seatbelt' },
  C3_controls: { id: 'C3_controls', src: '/training/svg/C3_controls.svg', alt: 'Forklift control icons: horn, parking brake, ignition, lift/tilt, lights, reverse' },
  C5_inspection: { id: 'C5_inspection', src: '/training/svg/C5_inspection.svg', alt: 'Daily inspection icons: tires, forks, chains, horn, lights, hydraulics, leaks, data plate' },
  D1_seatbelt: { id: 'D1_seatbelt', src: '/training/svg/D1_seatbelt.svg', alt: 'Animated seatbelt buckle and strap engagement' },
  D5_stability_cog: { id: 'D5_stability_cog', src: '/training/svg/D5_stability_cog.svg', alt: 'Stability triangle with moving center of gravity dot' }
};

export const ASSETS = A;
export function getAsset(id: keyof typeof A) { return ASSETS[id]; }
