import { readFileSync } from 'node:fs';

const svg = readFileSync('training/diagrams/charging-schematic-electric.svg', 'utf8');

const groups = [ 'forklift', 'charge-port', 'charger', 'cable', 'battery-icon', 'floor-markings', 'forks' ];

const missing = groups.filter(id => !new RegExp(`<g[^>]*id=["']${id}["']`, 'i').test(svg));

if (missing.length) { 
  console.error('Missing required <g id> groups:', missing.join(', ')); 
  process.exit(2); 
}

console.log('✅ A3 SVG OK — all required groups present');
