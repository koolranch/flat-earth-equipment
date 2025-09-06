import { readFileSync } from 'node:fs';

const svg = readFileSync('training/diagrams/stability-triangle.svg', 'utf8');

const groups = [
  'forklift-body',
  'triangle',
  'wheelbase',
  'rear-axle-pivot',
  'load-center-line',
  'cog-dot',
  'forks'
];

const missing = groups.filter(id => !new RegExp(`<g[^>]*id=["']${id}["']`, 'i').test(svg));

if (missing.length) {
  console.error('Missing required <g id> groups:', missing.join(', '));
  process.exit(2);
}

console.log('✅ A2 SVG OK — all required groups present');
