import { readFileSync } from 'node:fs';

const svg = readFileSync('training/icons/shutdown-steps.svg', 'utf8');

const symbols = [
  'shutdown-step-1-neutral',
  'shutdown-step-2-steer-straight',
  'shutdown-step-3-brake-set',
  'shutdown-step-4-forks-down',
  'shutdown-step-5-key-off',
  'shutdown-step-6-connect-charger',
  'shutdown-step-7-wheel-chock'
];

const missing = symbols.filter((id) => !new RegExp(`<symbol[^>]*id=["']${id}["']`, 'i').test(svg));

if (missing.length) {
  console.error('Missing required <symbol id> in shutdown-steps.svg:', missing.join(', '));
  process.exit(2);
}

console.log('✅ C4 Shutdown Steps sprite OK — all 7 <symbol> IDs present');
