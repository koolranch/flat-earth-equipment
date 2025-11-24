/**
 * Import Class IV Standard Tapered Forks from Helmar
 * Using FEE-F4 prefix for Class IV forks
 * Pricing: Individual fork price × 2 (pair) × 1.40 (40% markup)
 */

import dotenv from 'dotenv';
import { writeFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

// Pricing from screenshot - PER INDIVIDUAL FORK
// Excluding: FORK-4222 (Special Order), FORK-4228 (Due 2/12/2026), FORK-4230 (Special Order)
const CLASS_IV_FORK_PRICING_PER_FORK: Record<string, number> = {
  'FORK-4212': 450.00,
  'FORK-4214': 490.00,
  'FORK-4218': 565.00,
  'FORK-4220': 500.00,
  'FORK-4224': 625.00,
  'FORK-4226': 550.00,
  // 'FORK-4228': 590.00, // Excluded - Due on 2/12/2026
  'FORK-4232': 570.00,
  'FORK-4234': 695.00,
  'FORK-4236': 645.00,
  'FORK-4238': 740.00,
  // 'FORK-4222': 695.00, // Excluded - Special Order
  // 'FORK-4230': 575.00, // Excluded - Special Order
};

const MARKUP = 1.40;

const CLASS_IV_FORK_PRODUCTS = [
  { sku: 'FORK-4212', name: 'CLASS IV FORK (2 1/4X6X42)' },
  { sku: 'FORK-4214', name: 'CLASS IV FORK (2 1/4X6X48)' },
  { sku: 'FORK-4218', name: 'CLASS IV FORK (2 1/4X6X60)' },
  { sku: 'FORK-4220', name: 'CLASS IV FORK (2 1/4X6X72)' },
  { sku: 'FORK-4224', name: 'CLASS IV FORK (2 1/4X6X96)' },
  { sku: 'FORK-4226', name: 'CLASS IV FORK (2 1/2X6X42)' },
  { sku: 'FORK-4232', name: 'CLASS IV FORK (2 1/2X6X60)' },
  { sku: 'FORK-4234', name: 'CLASS IV FORK (2 1/2X6X72)' },
  { sku: 'FORK-4236', name: 'CLASS IV FORK (2 1/2X6X84)' },
  { sku: 'FORK-4238', name: 'CLASS IV FORK (2 1/2X6X96)' },
];

function createSlug(sku: string, name: string): string {
  return `${sku}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDescription(name: string): string {
  return `Class IV standard tapered forklift forks, sold as a pair. Heavy-duty construction for maximum capacity material handling applications. ${name}. 1 Year Warranty.`;
}

const sqlStatements = CLASS_IV_FORK_PRODUCTS.map((product, index) => {
  const internalSku = `FEE-F4-${String(index + 1).padStart(3, '0')}`;
  const pricePerFork = CLASS_IV_FORK_PRICING_PER_FORK[product.sku];
  const pairPrice = pricePerFork * 2;
  const retailPrice = (pairPrice * MARKUP).toFixed(2);
  const slug = createSlug(internalSku, product.name);
  const description = formatDescription(product.name);
  
  const metadata = JSON.stringify({
    specifications: {
      dimensions: product.name.match(/\(([^)]+)\)/)?.[1] || '',
      class: 'Class IV',
      finish: 'Standard Tapered',
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
  
  return `('${internalSku}', '${product.sku}', '${product.name.replace(/'/g, "''")}', '${slug}', ${retailPrice}, 'Class IV Forks', 'Helmar', '${description.replace(/'/g, "''")}', 'https://www.helmarparts.info/Products/fork-4020_xr.jpg', '${metadata.replace(/'/g, "''")}'::jsonb, NOW(), NOW())`;
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

writeFileSync('scripts/helmar/data/class-iv-standard-fork-insert.sql', fullSQL);
console.log('\n\n✅ SQL saved to scripts/helmar/data/class-iv-standard-fork-insert.sql');
console.log(`\n📊 Summary:`);
console.log(`   Total Class IV Standard Tapered forks: ${CLASS_IV_FORK_PRODUCTS.length}`);
console.log(`   Internal SKUs: FEE-F4-001 through FEE-F4-${String(CLASS_IV_FORK_PRODUCTS.length).padStart(3, '0')}`);
console.log(`   Category: Class IV Forks`);
console.log(`   Finish: Standard Tapered (in metadata)`);
console.log(`   Pricing: (Individual fork × 2) × 1.40`);
console.log(`   Excluded: FORK-4222, FORK-4228, FORK-4230`);

