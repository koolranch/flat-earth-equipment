/**
 * Parse the Industrial Equipment Seats Quick Reference Guide PDF into structured JSON.
 *
 * Usage:
 *   npx tsx scripts/parse-seat-guide.ts
 *   npx tsx scripts/parse-seat-guide.ts "/path/to/guide.pdf"
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string; numpages: number }>;
import { parseSeatGuideText } from '../lib/seats/parseSeatGuideText';
import {
  buildEquipmentModelIndex,
  buildSeatFamilies,
  toSeatProductRecord,
} from '../lib/seats/buildSeatProduct';

const DEFAULT_PDF =
  '/Users/christopherray/Documents/TVH Industrial Equipment Seats Quick Reference Guide - SYPNIPASEATQRG.pdf';

const OUT_DIR = path.resolve(process.cwd(), 'data/seats');

async function main() {
  const pdfPath = process.argv[2] ?? DEFAULT_PDF;
  if (!fs.existsSync(pdfPath)) {
    console.error(`PDF not found: ${pdfPath}`);
    process.exit(1);
  }

  console.log(`📄 Parsing ${pdfPath}\n`);

  const buffer = fs.readFileSync(pdfPath);
  const parsed = await pdf(buffer);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, '_pdf-extract.txt'), parsed.text);

  const rows = parseSeatGuideText(parsed.text);
  const products = rows.map(toSeatProductRecord);
  const modelIndex = buildEquipmentModelIndex(products);
  const families = buildSeatFamilies(products);

  fs.writeFileSync(
    path.join(OUT_DIR, 'seat-products.json'),
    JSON.stringify(products, null, 2)
  );
  fs.writeFileSync(
    path.join(OUT_DIR, 'equipment-models.json'),
    JSON.stringify(modelIndex, null, 2)
  );
  fs.writeFileSync(
    path.join(OUT_DIR, 'seat-families.json'),
    JSON.stringify(families, null, 2)
  );

  const byBrand = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.brand] = (acc[p.brand] ?? 0) + 1;
    return acc;
  }, {});

  const byType = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.product_type] = (acc[p.product_type] ?? 0) + 1;
    return acc;
  }, {});

  console.log('='.repeat(60));
  console.log('SEAT GUIDE PARSE COMPLETE');
  console.log('='.repeat(60));
  console.log(`Products:          ${products.length}`);
  console.log(`Equipment models:  ${modelIndex.length}`);
  console.log(`Seat families:     ${families.length}`);
  console.log('\nBy product type:');
  for (const [k, v] of Object.entries(byType).sort()) console.log(`  ${k}: ${v}`);
  console.log('\nBy brand:');
  for (const [k, v] of Object.entries(byBrand).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`);
  }
  console.log(`\nWrote ${OUT_DIR}/seat-products.json`);
}

main().catch((e) => {
  console.error('❌ Fatal:', e);
  process.exit(1);
});
