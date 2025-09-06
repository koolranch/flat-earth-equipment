import { readFileSync } from 'node:fs';

const svg = readFileSync('training/icons/control-icons.svg', 'utf8');

const symbols = [
  'icon-control-horn',
  'icon-control-parking-brake',
  'icon-control-ignition',
  'icon-control-lift',
  'icon-control-tilt',
  'icon-control-level-forks',
  'icon-control-lights',
  'icon-control-reverse'
];

const missing = symbols.filter(id => !new RegExp(`<symbol[^>]*id=["']${id}["']`, 'i').test(svg));

if (missing.length) { 
  console.error('Missing required <symbol id>:', missing.join(', ')); 
  process.exit(2); 
}

console.log('✅ C3 Control sprite OK — all required <symbol> IDs present');
