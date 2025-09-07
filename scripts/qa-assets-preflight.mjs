import fs from 'node:fs';
import path from 'node:path';

const required = [
  'A1_controls.svg',
  'C1_ppe.svg',
  'C3_controls.svg',
  'C5_inspection.svg',
  'D1_seatbelt.svg',
  'D5_stability_cog.svg'
];

const base = path.join(process.cwd(), 'public', 'training', 'svg');
const missing = [];
for (const f of required) {
  const p = path.join(base, f);
  if (!fs.existsSync(p)) missing.push(p);
}

if (missing.length === 0) {
  console.log('✅ All E1–E3 asset files present in public/training/svg');
  process.exit(0);
}

console.log('\n❌ Missing required SVG assets for E1–E3:\n');
for (const m of missing) console.log(' - ' + m);
console.log('\nNext steps:');
console.log('1) For each missing file, paste your full HTML/SVG output into a new file at that exact path.');
console.log('   If the output includes a full HTML document, keep only the <svg>…</svg> portion.');
console.log('2) Commit and re-run: npm run qa:assets:preflight');
process.exit(1);
