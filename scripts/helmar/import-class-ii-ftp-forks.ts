/**
 * Import Class II Full Tapered and Polished (FTP) Forks from Helmar
 * These continue the FEE-F2 sequence and use metadata to differentiate finish type
 * Pricing: Individual fork price × 2 (pair) × 1.40 (40% markup)
 */

import dotenv from 'dotenv';
import { writeFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

// Pricing from screenshot - PER INDIVIDUAL FORK
const FTP_FORK_PRICING_PER_FORK: Record<string, number> = {
  'FORK-4080': 220.00,  // 1 1/2X4X42 FTP
  'FORK-4082': 240.00,  // 1 1/2X4X48 FTP
  'FORK-4092': 270.00,  // 1 3/4X4X42 FTP
  'FORK-4094': 290.00,  // 1 3/4X4X48 FTP
  'FORK-4098': 300.00,  // 1 3/4X4X60 FTP
  'FORK-4104': 275.00,  // 1 1/2X5X42 FTP
  'FORK-4106': 280.00,  // 1 1/2X5X48 FTP
  'FORK-4116': 295.00,  // 1 3/4X5X42 FTP
  'FORK-4118': 295.00,  // 1 3/4X5X48 FTP
  'FORK-4120': 325.00,  // 1 3/4X5X54 FTP
  'FORK-4122': 325.00,  // 1 3/4X5X60 FTP
  'FORK-4124': 375.00,  // 1 3/4X5X72 FTP
  // FORK-4078 and FORK-4114 are special orders - excluded
};

const MARKUP = 1.40;

const FTP_FORK_PRODUCTS = [
  { sku: 'FORK-4080', name: 'CLASS II FORK (1 1/2X4X42 FTP)' },
  { sku: 'FORK-4082', name: 'CLASS II FORK (1 1/2X4X48 FTP)' },
  { sku: 'FORK-4092', name: 'CLASS II FORK (1 3/4X4X42 FTP)' },
  { sku: 'FORK-4094', name: 'CLASS II FORK (1 3/4X4X48 FTP)' },
  { sku: 'FORK-4098', name: 'CLASS II FORK (1 3/4X4X60 FTP)' },
  { sku: 'FORK-4104', name: 'CLASS II FORK (1 1/2X5X42 FTP)' },
  { sku: 'FORK-4106', name: 'CLASS II FORK (1 1/2X5X48 FTP)' },
  { sku: 'FORK-4116', name: 'CLASS II FORK (1 3/4X5X42 FTP)' },
  { sku: 'FORK-4118', name: 'CLASS II FORK (1 3/4X5X48 FTP)' },
  { sku: 'FORK-4120', name: 'CLASS II FORK (1 3/4X5X54 FTP)' },
  { sku: 'FORK-4122', name: 'CLASS II FORK (1 3/4X5X60 FTP)' },
  { sku: 'FORK-4124', name: 'CLASS II FORK (1 3/4X5X72 FTP)' },
];

function createSlug(sku: string, name: string): string {
  return `${sku}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDescription(name: string): string {
  return `Class II full tapered and polished forklift forks, sold as a pair. Premium polished finish for enhanced durability and performance. ${name}. 1 Year Warranty.`;
}

// Starting from FEE-F2-029 to continue the sequence
const START_NUMBER = 29;

const sqlStatements = FTP_FORK_PRODUCTS.map((product, index) => {
  const internalSku = `FEE-F2-${String(START_NUMBER + index).padStart(3, '0')}`;
  const pricePerFork = FTP_FORK_PRICING_PER_FORK[product.sku];
  const pairPrice = pricePerFork * 2;
  const retailPrice = (pairPrice * MARKUP).toFixed(2);
  const slug = createSlug(internalSku, product.name);
  const description = formatDescription(product.name);
  
  const metadata = JSON.stringify({
    specifications: {
      dimensions: product.name.match(/\(([^)]+)\)/)?.[1].replace(' FTP', '') || '',
      class: 'Class II',
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
  
  return `('${internalSku}', '${product.sku}', '${product.name.replace(/'/g, "''")}', '${slug}', ${retailPrice}, 'Class II Forks', 'Helmar', '${description.replace(/'/g, "''")}', 'https://www.helmarparts.info/Products/fork-4020_xr.jpg', '${metadata.replace(/'/g, "''")}'::jsonb, NOW(), NOW())`;
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

writeFileSync('scripts/helmar/data/ftp-fork-insert.sql', fullSQL);
console.log('\n\n✅ SQL saved to scripts/helmar/data/ftp-fork-insert.sql');
console.log(`\n📊 Summary:`);
console.log(`   Total FTP forks: ${FTP_FORK_PRODUCTS.length}`);
console.log(`   Internal SKUs: FEE-F2-029 through FEE-F2-040`);
console.log(`   Category: Class II Forks`);
console.log(`   Finish: Full Tapered and Polished (in metadata)`);
console.log(`   Pricing: (Individual fork × 2) × 1.40`);

