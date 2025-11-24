/**
 * Import Lumber Forks from Helmar (multi-class specialty forks)
 * Using FEE-LF prefix for Lumber Forks
 * Pricing: Individual fork price × 2 (pair) × 1.40 (40% markup)
 */

import dotenv from 'dotenv';
import { writeFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

// Pricing from screenshot - PER INDIVIDUAL FORK
// Excluding: FORK-4256 (Special Order), FORK-4260 (Special Order - Call for Price)
const LUMBER_FORK_PRICING_PER_FORK: Record<string, number> = {
  'FORK-4250': 590.00,  // Class II 1.5X8X48
  'FORK-4252': 590.00,  // Class III 1.5X8X48
  'FORK-4254': 690.00,  // Class IV 1.5X8X48
  'FORK-4258': 750.00,  // Class III 1.5X8X60
  // 'FORK-4256': 675.00, // Excluded - Special Order
  // 'FORK-4260': N/A,    // Excluded - Special Order, Call for Price
};

const MARKUP = 1.40;

const LUMBER_FORK_PRODUCTS = [
  { sku: 'FORK-4250', name: 'CLASS II FORK (1.5X8X48 FTP)', class: 'Class II' },
  { sku: 'FORK-4252', name: 'CLASS III FORK (1.5X8X48 FTP)', class: 'Class III' },
  { sku: 'FORK-4254', name: 'CLASS IV FORK (1.5X8X48 FTP)', class: 'Class IV' },
  { sku: 'FORK-4258', name: 'CLASS III FORK (1.5X8X60 FTP)', class: 'Class III' },
];

function createSlug(sku: string, name: string): string {
  return `${sku}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDescription(name: string, forkClass: string): string {
  return `${forkClass} lumber fork, full tapered and polished, sold as a pair. Extra-wide 8" design for lumber and sheet material handling. ${name}. 1 Year Warranty.`;
}

const sqlStatements = LUMBER_FORK_PRODUCTS.map((product, index) => {
  const internalSku = `FEE-LF-${String(index + 1).padStart(3, '0')}`;
  const pricePerFork = LUMBER_FORK_PRICING_PER_FORK[product.sku];
  const pairPrice = pricePerFork * 2;
  const retailPrice = (pairPrice * MARKUP).toFixed(2);
  const slug = createSlug(internalSku, product.name);
  const description = formatDescription(product.name, product.class);
  
  const metadata = JSON.stringify({
    specifications: {
      dimensions: product.name.match(/\(([^)]+)\)/)?.[1].replace(' FTP', '') || '',
      class: product.class,
      finish: 'Full Tapered and Polished',
      type: 'Lumber Fork',
      width: '8 inches',
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
  
  return `('${internalSku}', '${product.sku}', '${product.name.replace(/'/g, "''")}', '${slug}', ${retailPrice}, 'Lumber Forks', 'Helmar', '${description.replace(/'/g, "''")}', 'https://www.helmarparts.info/Products/fork-4020_xr.jpg', '${metadata.replace(/'/g, "''")}'::jsonb, NOW(), NOW())`;
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

writeFileSync('scripts/helmar/data/lumber-fork-insert.sql', fullSQL);
console.log('\n\n✅ SQL saved to scripts/helmar/data/lumber-fork-insert.sql');
console.log(`\n📊 Summary:`);
console.log(`   Total Lumber Forks: ${LUMBER_FORK_PRODUCTS.length}`);
console.log(`   Internal SKUs: FEE-LF-001 through FEE-LF-${String(LUMBER_FORK_PRODUCTS.length).padStart(3, '0')}`);
console.log(`   Category: Lumber Forks`);
console.log(`   Classes: Class II, Class III, Class IV (multi-class category)`);
console.log(`   Finish: Full Tapered and Polished`);
console.log(`   Pricing: (Individual fork × 2) × 1.40`);
console.log(`   Excluded: FORK-4256, FORK-4260 (special orders)`);

