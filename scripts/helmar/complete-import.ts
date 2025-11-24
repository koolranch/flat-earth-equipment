/**
 * Complete Helmar parts import - transforms data and inserts into Supabase
 * This script uses the pre-scraped data (from Firecrawl MCP) and completes the import
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { generatePartNumbers } from '@/lib/parts/generatePartNumber';
import { writeFileSync } from 'fs';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Dealer pricing from screenshot (40% markup for retail)
const HELMAR_DEALER_PRICING: Record<string, number> = {
  'FM-1-200': 840.00,
  'FM-1-300': 980.00,
  'FM-1-400': 880.00,
  'FM-1-500': 965.00,
  'RR-2-206': 995.00,
  'RR-2-209': 650.00,
  'RR-2-214': 875.00,
  'RR-2-219': 725.00,
  'RR-2-224': 650.00,
  'RR-3-310': 740.00,
  'RR-3-316': 895.00,
};

const MARKUP = 1.40;

// Product data extracted from Firecrawl scraping
const PRODUCT_DATA = [
  {
    helmarSku: 'FM-1-200',
    name: 'FORK MT RUG RAM (10X2 1/2)',
    specs: { diameter: '2.5"', baseSize: '543*116*1040 (MM)', effectiveLength: '10 feet', capacity: '1500kg @ 500mm', weight: '163kg' },
    imageUrl: 'https://www.helmarparts.info/Products/FM-1-200_xr.jpg'
  },
  {
    helmarSku: 'FM-1-300',
    name: 'FORK MT RUG RAM (10X2 3/4)',
    specs: { diameter: '2.75"', baseSize: '543*116*1040 (MM)', effectiveLength: '10 feet', capacity: '2000kg @ 500mm', weight: '190kg' },
    imageUrl: 'https://www.helmarparts.info/Products/FM-1-200_xr.jpg'
  },
  {
    helmarSku: 'FM-1-400',
    name: 'FORK MT RUG RAM (12X2 1/2)',
    specs: { diameter: '2.5"', baseSize: '543*116*1040 (MM)', effectiveLength: '12 feet', capacity: '1500kg @ 500mm', weight: '205kg' },
    imageUrl: 'https://www.helmarparts.info/Products/FM-1-200_xr.jpg'
  },
  {
    helmarSku: 'FM-1-500',
    name: 'FORK MT RUG RAM (12X2 3/4)',
    specs: { diameter: '2.75"', baseSize: '543*126*1040 (MM)', effectiveLength: '12 feet', capacity: '2000kg @ 500mm', weight: '222kg' },
    imageUrl: 'https://www.helmarparts.info/Products/FM-1-200_xr.jpg'
  },
  {
    helmarSku: 'RR-2-206',
    name: 'RUG RAM (CLASS II 9X2 3/4)',
    specs: { diameter: '2.75"', baseSize: 'N/A', effectiveLength: '9 feet', capacity: 'Class II', weight: 'N/A' },
    imageUrl: 'https://www.helmarparts.info/Products/FM-1-200_xr.jpg'
  },
  {
    helmarSku: 'RR-2-209',
    name: 'RUG RAM (CLASS II (10X2 3/4)',
    specs: { diameter: '2.75"', baseSize: 'N/A', effectiveLength: '10 feet', capacity: 'Class II', weight: 'N/A' },
    imageUrl: 'https://www.helmarparts.info/Products/FM-1-200_xr.jpg'
  },
  {
    helmarSku: 'RR-2-214',
    name: 'RUG RAM (CLASS II (10X3)',
    specs: { diameter: '3"', baseSize: 'N/A', effectiveLength: '10 feet', capacity: 'Class II', weight: 'N/A' },
    imageUrl: 'https://www.helmarparts.info/Products/FM-1-200_xr.jpg'
  },
  {
    helmarSku: 'RR-2-219',
    name: 'RUG RAM (CLASS II (12X2 1/2)',
    specs: { diameter: '2.5"', baseSize: 'N/A', effectiveLength: '12 feet', capacity: 'Class II', weight: 'N/A' },
    imageUrl: 'https://www.helmarparts.info/Products/FM-1-200_xr.jpg'
  },
  {
    helmarSku: 'RR-2-224',
    name: 'RUG RAM (CLASS II 12X2 3/4)',
    specs: { diameter: '2.75"', baseSize: 'N/A', effectiveLength: '12 feet', capacity: 'Class II', weight: 'N/A' },
    imageUrl: 'https://www.helmarparts.info/Products/FM-1-200_xr.jpg'
  },
  {
    helmarSku: 'RR-3-310',
    name: 'RUG RAM (CLASS III (10X2 3/4)',
    specs: { diameter: '2.75"', baseSize: 'N/A', effectiveLength: '10 feet', capacity: 'Class III', weight: 'N/A' },
    imageUrl: 'https://www.helmarparts.info/Products/FM-1-200_xr.jpg'
  },
  {
    helmarSku: 'RR-3-316',
    name: 'RUG RAM (CLASS III (12X2 3/4)',
    specs: { diameter: '2.75"', baseSize: 'N/A', effectiveLength: '12 feet', capacity: 'Class III', weight: 'N/A' },
    imageUrl: 'https://www.helmarparts.info/Products/FM-1-200_xr.jpg'
  },
];

function formatDescription(specs: any): string {
  const parts = [];
  if (specs.diameter && specs.diameter !== 'N/A') parts.push(`Diameter: ${specs.diameter}`);
  if (specs.baseSize && specs.baseSize !== 'N/A') parts.push(`Base Size: ${specs.baseSize}`);
  if (specs.effectiveLength && specs.effectiveLength !== 'N/A') parts.push(`Effective Length: ${specs.effectiveLength}`);
  if (specs.capacity && specs.capacity !== 'N/A') parts.push(`Capacity: ${specs.capacity}`);
  if (specs.weight && specs.weight !== 'N/A') parts.push(`Weight: ${specs.weight}`);
  
  return `Fork mounted rug ram. ${parts.join(', ')}. 1 Year Warranty.`;
}

function createSlug(sku: string, name: string): string {
  return `${sku}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('🚀 Starting Helmar parts import...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Generate internal SKUs
  console.log('🔢 Generating internal part numbers...');
  const internalSkus = await generatePartNumbers(PRODUCT_DATA.length, 'FEE-RC', supabaseUrl, supabaseKey);
  console.log(`Generated: ${internalSkus.join(', ')}\n`);
  
  // Transform and prepare data
  console.log('📦 Transforming product data...');
  const transformedProducts = PRODUCT_DATA.map((product, index) => {
    const internalSku = internalSkus[index];
    const dealerPrice = HELMAR_DEALER_PRICING[product.helmarSku];
    const retailPrice = dealerPrice * MARKUP;
    
    return {
      sku: internalSku,
      vendor_sku: product.helmarSku,
      name: product.name,
      slug: createSlug(internalSku, product.name),
      price: parseFloat(retailPrice.toFixed(2)),
      category: 'Rug / Carpet Rams',
      brand: 'Helmar',
      description: formatDescription(product.specs),
      image_url: product.imageUrl, // Using Helmar URLs for now
      metadata: {
        specifications: product.specs,
        vendor: {
          name: 'Helmar',
          partNumber: product.helmarSku,
          originalUrl: `https://www.helmarparts.info/ProductDetails?pn=${product.helmarSku}`
        },
        warranty: '1 Year',
        dealerCost: dealerPrice
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });
  
  // Save to JSON for review
  writeFileSync(
    'scripts/helmar/data/transformed-products.json',
    JSON.stringify(transformedProducts, null, 2)
  );
  console.log('✅ Saved transformed data to scripts/helmar/data/transformed-products.json\n');
  
  // Insert into database
  console.log('💾 Inserting products into database...');
  let successCount = 0;
  let errorCount = 0;
  
  for (const product of transformedProducts) {
    try {
      const { error } = await supabase
        .from('parts')
        .upsert(product, { onConflict: 'sku' });
      
      if (error) {
        console.error(`❌ Error inserting ${product.sku}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Inserted ${product.sku} - ${product.name} - $${product.price}`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Exception inserting ${product.sku}:`, err);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Import Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📦 Total: ${transformedProducts.length}`);
  
  // Create import log
  const log = {
    timestamp: new Date().toISOString(),
    successCount,
    errorCount,
    products: transformedProducts.map(p => ({
      internalSku: p.sku,
      vendorSku: p.vendor_sku,
      name: p.name,
      price: p.price
    }))
  };
  
  writeFileSync(
    'logs/helmar-import.log',
    JSON.stringify(log, null, 2)
  );
  console.log('\n📝 Import log saved to logs/helmar-import.log');
  
  console.log('\n✨ Import complete!');
}

// Run if this is the main module
main().catch(console.error);

export { PRODUCT_DATA, HELMAR_DEALER_PRICING };

