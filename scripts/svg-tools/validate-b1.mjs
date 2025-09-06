import { readFileSync } from 'node:fs';

const svg = readFileSync('training/scenes/warehouse-bay-1.svg', 'utf8');

const groups = [
  'scene',
  'racks',
  'pallets',
  'floor-markings',
  'pedestrian',
  'hazard-spill',
  'hazard-pedestrian',
  'hazard-overhead',
  'hazard-unstable-load',
  'hazard-speed-zone'
];

const missing = groups.filter(id => !new RegExp(`<g[^>]*id=["']${id}["']`, 'i').test(svg));

if (missing.length) { 
  console.error('Missing required <g id> groups:', missing.join(', ')); 
  process.exit(2); 
}

console.log('✅ B1 SVG OK — all required groups present');
