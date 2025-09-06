import { readFileSync } from 'node:fs';

const svg = readFileSync('training/diagrams/forklift-controls.svg', 'utf8');

const groups = [
  'forklift-body',
  'control-steering-wheel',
  'control-lift-lever',
  'control-tilt-lever',
  'control-horn-button',
  'control-parking-brake',
  'control-ignition-key',
  'control-seatbelt-latch',
  'control-mast',
  'control-forks'
];

const missing = groups.filter(id => !new RegExp(`<g[^>]*id=["']${id}["']`, 'i').test(svg));

if (missing.length) {
  console.error('Missing required <g id> groups:', missing.join(', '));
  process.exit(2);
}

console.log('✅ A1 SVG OK — all required groups present');
