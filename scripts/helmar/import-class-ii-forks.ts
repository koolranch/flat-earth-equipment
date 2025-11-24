/**
 * Import Class II Standard Tapered Forks from Helmar
 * Pricing: Individual fork price × 2 (pair) × 1.40 (40% markup)
 */

import dotenv from 'dotenv';
import { writeFileSync } from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Pricing from screenshot - these are PER INDIVIDUAL FORK
// We sell in PAIRS, so multiply by 2, then add 40% markup
const FORK_PRICING_PER_FORK: Record<string, number> = {
  'FORK-4020': 145.00,  // 32" fork
  'FORK-4022': 152.00,  // 36" fork
  'FORK-4024': 161.00,  // 42" fork
  'FORK-4026': 174.00,  // 48" fork
  'FORK-4028': 184.00,  // 54" fork
  'FORK-4030': 195.00,  // 60" fork
  'FORK-4032': 213.00,  // 72" fork
  'FORK-4034': 153.00,  // 1 3/4x4x36
  'FORK-4036': 176.00,  // 1 3/4x4x42
  'FORK-4038': 182.00,  // 1 3/4x4x48
  'FORK-4040': 194.00,  // 1 3/4x4x54
  'FORK-4042': 204.00,  // 1 3/4x4x60
  'FORK-4044': 231.00,  // 1 3/4x4x72
  'FORK-4046': 285.00,  // 1 3/4x4x84
  'FORK-4048': 326.00,  // 1 3/4x4x96
  'FORK-4050': 187.00,  // 2x5x36
  'FORK-4052': 173.00,  // 1 1/2x5x42
  'FORK-4054': 186.00,  // 1 1/2x5x48
  'FORK-4058': 229.00,  // 1 1/2x5x60
  'FORK-4060': 270.00,  // 1 1/2x5x72
  'FORK-4064': 194.00,  // 1 3/4x5x42
  'FORK-4066': 206.00,  // 1 3/4x5x48
  'FORK-4068': 215.00,  // 1 3/4x5x54
  'FORK-4070': 250.00,  // 1 3/4x5x60
  'FORK-4071': 364.00,  // 2x5x72
  'FORK-4072': 286.00,  // 1 3/4x5x72
  'FORK-4074': 349.00,  // 1 3/4x5x84
  'FORK-4076': 393.00,  // 1 3/4x5x96
  // FORK-4102 is special order - excluded
};

const MARKUP = 1.40; // 40% markup

// Product data (names from scraped listing)
const FORK_PRODUCTS = [
  { sku: 'FORK-4020', name: 'CLASS II FORK (1 1/2X4X32)' },
  { sku: 'FORK-4022', name: 'CLASS II FORK (1 1/2X4X36)' },
  { sku: 'FORK-4024', name: 'CLASS II FORK (1 1/2X4X42)' },
  { sku: 'FORK-4026', name: 'CLASS II FORK (1 1/2X4X48)' },
  { sku: 'FORK-4028', name: 'CLASS II FORK (1 1/2X4X54)' },
  { sku: 'FORK-4030', name: 'CLASS II FORK (1 1/2X4X60)' },
  { sku: 'FORK-4032', name: 'CLASS II FORK (1 1/2X4X72)' },
  { sku: 'FORK-4034', name: 'CLASS II FORK (1 3/4X4X36)' },
  { sku: 'FORK-4036', name: 'CLASS II FORK (1 3/4X4X42)' },
  { sku: 'FORK-4038', name: 'CLASS II FORK (1 3/4X4X48)' },
  { sku: 'FORK-4040', name: 'CLASS II FORK (1 3/4X4X54)' },
  { sku: 'FORK-4042', name: 'CLASS II FORK (1 3/4X4X60)' },
  { sku: 'FORK-4044', name: 'CLASS II FORK (1 3/4X4X72)' },
  { sku: 'FORK-4046', name: 'CLASS II FORK (1 3/4X4X84)' },
  { sku: 'FORK-4048', name: 'CLASS II FORK (1 3/4X4X96)' },
  { sku: 'FORK-4050', name: 'CLASS II FORK (2X5X36)' },
  { sku: 'FORK-4052', name: 'CLASS II FORK (1 1/2X5X42)' },
  { sku: 'FORK-4054', name: 'CLASS II FORK (1 1/2X5X48)' },
  { sku: 'FORK-4058', name: 'CLASS II FORK (1 1/2X5X60)' },
  { sku: 'FORK-4060', name: 'CLASS II FORK (1 1/2X5X72)' },
  { sku: 'FORK-4064', name: 'CLASS II FORK (1 3/4X5X42)' },
  { sku: 'FORK-4066', name: 'CLASS II FORK (1 3/4X5X48)' },
  { sku: 'FORK-4068', name: 'CLASS II FORK (1 3/4X5X54)' },
  { sku: 'FORK-4070', name: 'CLASS II FORK (1 3/4X5X60)' },
  { sku: 'FORK-4071', name: 'CLASS II FORK (2X5X72)' },
  { sku: 'FORK-4072', name: 'CLASS II FORK (1 3/4X5X72)' },
  { sku: 'FORK-4074', name: 'CLASS II FORK (1 3/4X5X84)' },
  { sku: 'FORK-4076', name: 'CLASS II FORK (1 3/4X5X96)' },
];

function createSlug(sku: string, name: string): string {
  return `${sku}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDescription(name: string): string {
  return `Class II standard tapered forklift forks, sold as a pair. Heavy-duty construction for material handling applications. ${name}. 1 Year Warranty.`;
}

// Generate SQL statements
const sqlStatements = FORK_PRODUCTS.map((product, index) => {
  const internalSku = `FEE-F2-${String(index + 1).padStart(3, '0')}`;
  const pricePerFork = FORK_PRICING_PER_FORK[product.sku];
  const pairPrice = pricePerFork * 2;
  const retailPrice = (pairPrice * MARKUP).toFixed(2);
  const slug = createSlug(internalSku, product.name);
  const description = formatDescription(product.name);
  
  const metadata = JSON.stringify({
    specifications: {
      dimensions: product.name.match(/\(([^)]+)\)/)?.[1] || '',
      class: 'Class II',
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

// Save for reference
writeFileSync('scripts/helmar/data/fork-insert.sql', fullSQL);
console.log('\n\n✅ SQL saved to scripts/helmar/data/fork-insert.sql');
console.log(`\n📊 Summary:`);
console.log(`   Total forks: ${FORK_PRODUCTS.length}`);
console.log(`   Internal SKUs: FEE-F2-001 through FEE-F2-${String(FORK_PRODUCTS.length).padStart(3, '0')}`);
console.log(`   Category: Class II Forks`);
console.log(`   Pricing: (Individual fork × 2) × 1.40`);

