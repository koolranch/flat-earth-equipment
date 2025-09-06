import { readFileSync } from 'node:fs';

const svg = readFileSync('training/icons/inspection-icons.svg', 'utf8');

const ids = [
  'inspect-tires',
  'inspect-forks',
  'inspect-chains',
  'inspect-horn',
  'inspect-lights',
  'inspect-hydraulics',
  'inspect-leaks',
  'inspect-data-plate'
];

const missing = ids.filter((id) => !new RegExp(`<symbol[^>]*id=["']${id}["']`, 'i').test(svg));

if (missing.length) {
  console.error('Missing <symbol> IDs in inspection-icons.svg:', missing.join(', '));
  process.exit(2);
}

console.log('✅ C5 Inspection sprite OK — all 8 <symbol> IDs present');
