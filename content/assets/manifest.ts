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

// Extend manifest with Module 4/5 assets (if missing)
A.B1_warehouse_bay = { id: 'B1_warehouse_bay', src: '/training/svg/B1_warehouse_bay.svg', alt: 'Warehouse bay scene with racks, walkway and hazards' };
A.B2_blind_corner  = { id: 'B2_blind_corner',  src: '/training/svg/B2_blind_corner.svg',  alt: 'Aisle with blind corner and mirror, walkway and hazards' };
A.B3_dock_ramp     = { id: 'B3_dock_ramp',     src: '/training/svg/B3_dock_ramp.svg',     alt: 'Loading ramp and dock scene with hazards' };
A.C2_hazard_icons  = { id: 'C2_hazard_icons',  src: '/training/svg/C2_hazard_icons.svg',  alt: 'Hazard sprite icons: spill, pedestrian, overhead, unstable, blind corner, speed, ramp/slope, dock edge, battery' };

A.C4_shutdown = { id: 'C4_shutdown', src: '/training/svg/C4_shutdown_steps.svg', alt: 'Seven-step shutdown sprite: neutral, steer straight, brake, forks down, key off, connect charger, wheel chock' };
A.D2_brake = { id: 'D2_brake', src: '/training/svg/D2_parking_brake.svg', alt: 'Animated parking brake set' };
A.D3_forks = { id: 'D3_forks', src: '/training/svg/D3_forks_lower.svg', alt: 'Animated forks lowering to ground' };
A.D4_charge = { id: 'D4_charge', src: '/training/svg/D4_connect_charger.svg', alt: 'Animated connect charger to port' };

export function getAsset(id: keyof typeof A) { return ASSETS[id]; }
