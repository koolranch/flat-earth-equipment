/**
 * Import Class III Standard Tapered Forks from Helmar
 * Using FEE-F3 prefix for Class III forks
 * Pricing: Individual fork price × 2 (pair) × 1.40 (40% markup)
 */

import dotenv from 'dotenv';
import { writeFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

// Pricing from screenshot - PER INDIVIDUAL FORK
// Excluding: FORK-4144 (Due 1/7/2026), FORK-4158 (Due 2/12/2026), FORK-4171 (Special Order)
const CLASS_III_FORK_PRICING_PER_FORK: Record<string, number> = {
  'FORK-4126': 125.00,
  'FORK-4128': 210.00,
  'FORK-4130': 250.00,
  'FORK-4132': 190.00,
  'FORK-4134': 340.00,
  'FORK-4136': 300.00,
  'FORK-4138': 300.00,
  'FORK-4140': 390.00,
  'FORK-4142': 240.00,
  // 'FORK-4144': 345.00, // Excluded - Due on 1/7/2026
  'FORK-4146': 275.00,
  'FORK-4148': 300.00,
  'FORK-4150': 310.00,
  'FORK-4152': 275.00,
  'FORK-4154': 425.00,
  'FORK-4156': 335.00,
  // 'FORK-4158': 280.00, // Excluded - Due on 2/12/2026
  'FORK-4160': 340.00,
  'FORK-4162': 375.00,
  'FORK-4164': 345.00,
  'FORK-4166': 380.00,
  'FORK-4168': 440.00,
  'FORK-4170': 520.00,
  // 'FORK-4171': 520.00, // Excluded - Special Order
};

const MARKUP = 1.40;

const CLASS_III_FORK_PRODUCTS = [
  { sku: 'FORK-4126', name: 'CLASS III FORK (1 3/4X5X36)' },
  { sku: 'FORK-4128', name: 'CLASS III FORK (1 3/4X5X42)' },
  { sku: 'FORK-4130', name: 'CLASS III FORK (1 3/4X5X48)' },
  { sku: 'FORK-4132', name: 'CLASS III FORK (1 3/4X5X54)' },
  { sku: 'FORK-4134', name: 'CLASS III FORK (1 3/4X5X60)' },
  { sku: 'FORK-4136', name: 'CLASS III FORK (1 3/4X5X72)' },
  { sku: 'FORK-4138', name: 'CLASS III FORK (1 3/4X5X84)' },
  { sku: 'FORK-4140', name: 'CLASS III FORK (1 3/4X5X96)' },
  { sku: 'FORK-4142', name: 'CLASS III FORK (2X5X36)' },
  { sku: 'FORK-4146', name: 'CLASS III FORK (2X5X48)' },
  { sku: 'FORK-4148', name: 'CLASS III FORK (2X5X54)' },
  { sku: 'FORK-4150', name: 'CLASS III FORK (2X5X60)' },
  { sku: 'FORK-4152', name: 'CLASS III FORK (2X5X72)' },
  { sku: 'FORK-4154', name: 'CLASS III FORK (2X5X84)' },
  { sku: 'FORK-4156', name: 'CLASS III FORK (2X5X96)' },
  { sku: 'FORK-4160', name: 'CLASS III FORK (2X6X48)' },
  { sku: 'FORK-4162', name: 'CLASS III FORK (2X6X54)' },
  { sku: 'FORK-4164', name: 'CLASS III FORK (2X6X60)' },
  { sku: 'FORK-4166', name: 'CLASS III FORK (2X6X72)' },
  { sku: 'FORK-4168', name: 'CLASS III FORK (2X6X84)' },
  { sku: 'FORK-4170', name: 'CLASS III FORK (2X6X96)' },
];

function createSlug(sku: string, name: string): string {
  return `${sku}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDescription(name: string): string {
  return `Class III standard tapered forklift forks, sold as a pair. Heavy-duty construction for higher capacity material handling applications. ${name}. 1 Year Warranty.`;
}

const sqlStatements = CLASS_III_FORK_PRODUCTS.map((product, index) => {
  const internalSku = `FEE-F3-${String(index + 1).padStart(3, '0')}`;
  const pricePerFork = CLASS_III_FORK_PRICING_PER_FORK[product.sku];
  const pairPrice = pricePerFork * 2;
  const retailPrice = (pairPrice * MARKUP).toFixed(2);
  const slug = createSlug(internalSku, product.name);
  const description = formatDescription(product.name);
  
  const metadata = JSON.stringify({
    specifications: {
      dimensions: product.name.match(/\(([^)]+)\)/)?.[1] || '',
      class: 'Class III',
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

writeFileSync('scripts/helmar/data/class-iii-standard-fork-insert.sql', fullSQL);
console.log('\n\n✅ SQL saved to scripts/helmar/data/class-iii-standard-fork-insert.sql');
console.log(`\n📊 Summary:`);
console.log(`   Total Class III Standard Tapered forks: ${CLASS_III_FORK_PRODUCTS.length}`);
console.log(`   Internal SKUs: FEE-F3-001 through FEE-F3-${String(CLASS_III_FORK_PRODUCTS.length).padStart(3, '0')}`);
console.log(`   Category: Class III Forks`);
console.log(`   Finish: Standard Tapered (in metadata)`);
console.log(`   Pricing: (Individual fork × 2) × 1.40`);
console.log(`   Excluded: FORK-4144, FORK-4158 (on order), FORK-4171 (special order)`);

