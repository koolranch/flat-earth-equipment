import { readFileSync } from 'node:fs';

const svg = readFileSync('training/icons/ppe-icons.svg', 'utf8');

const symbols = [
  'icon-ppe-vest',
  'icon-ppe-hardhat',
  'icon-ppe-boots',
  'icon-ppe-goggles',
  'icon-ppe-earmuffs',
  'icon-ppe-seatbelt'
];

const missing = symbols.filter(id => !new RegExp(`<symbol[^>]*id=["']${id}["']`, 'i').test(svg));

if (missing.length) { 
  console.error('Missing required <symbol id>:', missing.join(', ')); 
  process.exit(2); 
}

console.log('✅ C1 PPE sprite OK — all required <symbol> IDs present');
