export type AssetKey =
  | 'ppe_vest' | 'ppe_hardhat' | 'ppe_boots' | 'ppe_goggles' | 'ppe_earmuffs' | 'ppe_seatbelt'
  | 'haz_spill' | 'haz_ped' | 'haz_overhead' | 'haz_unstable' | 'haz_blind' | 'haz_speed' | 'haz_ramp' | 'haz_dock' | 'haz_battery'
  | 'ctrl_horn' | 'ctrl_parking' | 'ctrl_ignition' | 'ctrl_lift' | 'ctrl_tilt' | 'ctrl_level' | 'ctrl_lights' | 'ctrl_reverse'
  | 'inspect_tires' | 'inspect_forks' | 'inspect_chains' | 'inspect_horn' | 'inspect_lights' | 'inspect_hydraulics' | 'inspect_leaks' | 'inspect_plate'
  | 'scene_bay' | 'scene_corner' | 'scene_ramp'
  | 'diag_controls' | 'diag_triangle' | 'diag_charge'
  | 'anim_seatbelt' | 'anim_parking' | 'anim_forks_down' | 'anim_connect' | 'anim_cog';

const base = (p: string) => p.startsWith('/') ? p : `/${p}`;

export const ASSETS: Record<AssetKey, string> = {
  // A: diagrams
  diag_controls: base('training/svg/A1_controls.svg'),
  diag_triangle: base('training/svg/A2_stability_triangle.svg'), // Note: may need to create this
  diag_charge: base('training/svg/A3_charging_schematic.svg'), // Note: may need to create this
  // B: hotspot scenes
  scene_bay: base('training/svg/B1_warehouse_bay.svg'),
  scene_corner: base('training/svg/B2_blind_corner.svg'),
  scene_ramp: base('training/svg/B3_dock_ramp.svg'),
  // C: sprites
  ppe_vest: base('training/svg/C1_ppe.svg#icon-ppe-vest'),
  ppe_hardhat: base('training/svg/C1_ppe.svg#icon-ppe-hardhat'),
  ppe_boots: base('training/svg/C1_ppe.svg#icon-ppe-boots'),
  ppe_goggles: base('training/svg/C1_ppe.svg#icon-ppe-goggles'),
  ppe_earmuffs: base('training/svg/C1_ppe.svg#icon-ppe-earmuffs'),
  ppe_seatbelt: base('training/svg/C1_ppe.svg#icon-ppe-seatbelt'),
  haz_spill: base('training/svg/C2_hazard_icons.svg#icon-hazard-spill'),
  haz_ped: base('training/svg/C2_hazard_icons.svg#icon-hazard-pedestrian'),
  haz_overhead: base('training/svg/C2_hazard_icons.svg#icon-hazard-overhead'),
  haz_unstable: base('training/svg/C2_hazard_icons.svg#icon-hazard-unstable-load'),
  haz_blind: base('training/svg/C2_hazard_icons.svg#icon-hazard-blind-corner'),
  haz_speed: base('training/svg/C2_hazard_icons.svg#icon-hazard-speed-zone'),
  haz_ramp: base('training/svg/C2_hazard_icons.svg#icon-hazard-ramp-slope'),
  haz_dock: base('training/svg/C2_hazard_icons.svg#icon-hazard-dock-edge'),
  haz_battery: base('training/svg/C2_hazard_icons.svg#icon-hazard-battery'),
  ctrl_horn: base('training/svg/C3_controls.svg#icon-control-horn'),
  ctrl_parking: base('training/svg/C3_controls.svg#icon-control-parking-brake'),
  ctrl_ignition: base('training/svg/C3_controls.svg#icon-control-ignition'),
  ctrl_lift: base('training/svg/C3_controls.svg#icon-control-lift'),
  ctrl_tilt: base('training/svg/C3_controls.svg#icon-control-tilt'),
  ctrl_level: base('training/svg/C3_controls.svg#icon-control-level-forks'),
  ctrl_lights: base('training/svg/C3_controls.svg#icon-control-lights'),
  ctrl_reverse: base('training/svg/C3_controls.svg#icon-control-reverse'),
  inspect_tires: base('training/svg/C5_inspection.svg#inspect-tires'),
  inspect_forks: base('training/svg/C5_inspection.svg#inspect-forks'),
  inspect_chains: base('training/svg/C5_inspection.svg#inspect-chains'),
  inspect_horn: base('training/svg/C5_inspection.svg#inspect-horn'),
  inspect_lights: base('training/svg/C5_inspection.svg#inspect-lights'),
  inspect_hydraulics: base('training/svg/C5_inspection.svg#inspect-hydraulics'),
  inspect_leaks: base('training/svg/C5_inspection.svg#inspect-leaks'),
  inspect_plate: base('training/svg/C5_inspection.svg#inspect-data-plate'),
  // D: animated
  anim_seatbelt: base('training/animations/d1-seatbelt.svg'),
  anim_parking: base('training/animations/d2-parking-brake.svg'),
  anim_forks_down: base('training/animations/d3-forks-lower.svg'),
  anim_connect: base('training/animations/d4-connect-charger.svg'),
  anim_cog: base('training/animations/d5-stability-triangle.svg')
};
