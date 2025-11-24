/**
 * Import Class III Full Tapered and Polished (FTP) Forks from Helmar
 * Continuing FEE-F3 sequence from 022, same category as Class III Standard
 * Pricing: Individual fork price × 2 (pair) × 1.40 (40% markup)
 */

import dotenv from 'dotenv';
import { writeFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

// Pricing from screenshot - PER INDIVIDUAL FORK
// Excluding: FORK-4192, FORK-4195 (Special Orders)
const CLASS_III_FTP_PRICING_PER_FORK: Record<string, number> = {
  'FORK-4174': 290.00,
  'FORK-4176': 375.00,
  'FORK-4178': 365.00,
  'FORK-4180': 365.00,
  'FORK-4188': 385.00,
  'FORK-4194': 320.00,
  'FORK-4196': 525.00,
  'FORK-4200': 420.00,
};

const MARKUP = 1.40;

const CLASS_III_FTP_PRODUCTS = [
  { sku: 'FORK-4174', name: 'CLASS III FORK (1 3/4X5X42 FTP)' },
  { sku: 'FORK-4176', name: 'CLASS III FORK (1 3/4X5X48 FTP)' },
  { sku: 'FORK-4178', name: 'CLASS III FORK (1 3/4X5X54 FTP)' },
  { sku: 'FORK-4180', name: 'CLASS III FORK (1 3/4X5X60 FTP)' },
  { sku: 'FORK-4188', name: 'CLASS III FORK (2X5X48 FTP)' },
  { sku: 'FORK-4194', name: 'CLASS III FORK (2X5X72 FTP)' },
  { sku: 'FORK-4196', name: 'CLASS III FORK (2X5X96 FTP)' },
  { sku: 'FORK-4200', name: 'CLASS III FORK (2X6X48 FTP)' },
];

function createSlug(sku: string, name: string): string {
  return `${sku}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDescription(name: string): string {
  return `Class III full tapered and polished forklift forks, sold as a pair. Premium polished finish for enhanced durability and performance in higher capacity applications. ${name}. 1 Year Warranty.`;
}

// Starting from FEE-F3-022 to continue the Class III sequence
const START_NUMBER = 22;

const sqlStatements = CLASS_III_FTP_PRODUCTS.map((product, index) => {
  const internalSku = `FEE-F3-${String(START_NUMBER + index).padStart(3, '0')}`;
  const pricePerFork = CLASS_III_FTP_PRICING_PER_FORK[product.sku];
  const pairPrice = pricePerFork * 2;
  const retailPrice = (pairPrice * MARKUP).toFixed(2);
  const slug = createSlug(internalSku, product.name);
  const description = formatDescription(product.name);
  
  const metadata = JSON.stringify({
    specifications: {
      dimensions: product.name.match(/\(([^)]+)\)/)?.[1].replace(' FTP', '') || '',
      class: 'Class III',
      finish: 'Full Tapered and Polished',  // KEY DIFFERENTIATOR
      soldAs: 'Pair'
    },
    vendor: {
      name: 'Helmar',
      partNumber: product.sku,
      originalUrl: `https://www.helmarparts.info/ProductDetails?pn=${product.sku}`
    },
    pricing: {
      dealerCostPerFork: pricePerFork,
      dealerCostPair: pairPrice,
      pricingNote: 'Sold in pairs - price reflects pair with 40% markup'
    },
    warranty: '1 Year'
  });
  
  return `('${internalSku}', '${product.sku}', '${product.name.replace(/'/g, "''")}', '${slug}', ${retailPrice}, 'Class III Forks', 'Helmar', '${description.replace(/'/g, "''")}', 'https://www.helmarparts.info/Products/fork-4020_xr.jpg', '${metadata.replace(/'/g, "''")}'::jsonb, NOW(), NOW())`;
}).join(',\n  ');

const fullSQL = `INSERT INTO parts (sku, vendor_sku, name, slug, price, category, brand, description, image_url, metadata, created_at, updated_at)
VALUES 
  ${sqlStatements}
ON CONFLICT (sku) DO UPDATE SET
  price = EXCLUDED.price,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();`;

console.log(fullSQL);

writeFileSync('scripts/helmar/data/class-iii-ftp-fork-insert.sql', fullSQL);
console.log('\n\n✅ SQL saved to scripts/helmar/data/class-iii-ftp-fork-insert.sql');
console.log(`\n📊 Summary:`);
console.log(`   Total Class III FTP forks: ${CLASS_III_FTP_PRODUCTS.length}`);
console.log(`   Internal SKUs: FEE-F3-022 through FEE-F3-${String(START_NUMBER + CLASS_III_FTP_PRODUCTS.length - 1).padStart(3, '0')}`);
console.log(`   Category: Class III Forks`);
console.log(`   Finish: Full Tapered and Polished (in metadata)`);
console.log(`   Pricing: (Individual fork × 2) × 1.40`);
console.log(`   Excluded: FORK-4192, FORK-4195 (special orders)`);

