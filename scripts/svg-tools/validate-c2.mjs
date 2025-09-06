import { readFileSync } from 'node:fs';

const svg = readFileSync('training/icons/hazard-icons.svg', 'utf8');

const symbols = [
  'icon-hazard-spill',
  'icon-hazard-pedestrian',
  'icon-hazard-overhead',
  'icon-hazard-unstable-load',
  'icon-hazard-blind-corner',
  'icon-hazard-speed-zone',
  'icon-hazard-ramp-slope',
  'icon-hazard-dock-edge',
  'icon-hazard-battery'
];

const missing = symbols.filter(id => !new RegExp(`<symbol[^>]*id=["']${id}["']`, 'i').test(svg));

if (missing.length) { 
  console.error('Missing required <symbol id>:', missing.join(', ')); 
  process.exit(2); 
}

console.log('✅ C2 Hazard sprite OK — all required <symbol> IDs present');
