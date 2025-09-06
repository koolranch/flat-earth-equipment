import { readFileSync } from 'node:fs';

const svg = readFileSync('training/scenes/aisle-blind-corner.svg', 'utf8');

const groups = [ 'scene', 'aisle', 'corner', 'mirror', 'floor-markings', 'hazard-blind-corner', 'hazard-pedestrian', 'hazard-speed-zone', 'hazard-spill' ];

const missing = groups.filter(id => !new RegExp(`<g[^>]*id=["']${id}["']`, 'i').test(svg));

if (missing.length) { 
  console.error('Missing required <g id> groups:', missing.join(', ')); 
  process.exit(2); 
}

console.log('✅ B2 SVG OK — all required groups present');
