import { readFileSync } from 'node:fs';

const svg = readFileSync('training/scenes/loading-ramp.svg', 'utf8');

const groups = [
  'scene',
  'ramp',
  'dock-edge',
  'wheel-chock-zone',
  'floor-markings',
  'hazard-ramp-slope',
  'hazard-dock-edge',
  'hazard-unstable-load',
  'hazard-pedestrian'
];

const missing = groups.filter(id => !new RegExp(`<g[^>]*id=["']${id}["']`, 'i').test(svg));

if (missing.length) { 
  console.error('Missing required <g id> groups:', missing.join(', ')); 
  process.exit(2); 
}

console.log('✅ B3 SVG OK — all required groups present');
