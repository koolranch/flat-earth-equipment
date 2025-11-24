import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { writeFileSync, existsSync } from 'fs';

// Load environment variables
const envProdLocalPath = resolve(process.cwd(), '.env.production.local');
const envLocalPath = resolve(process.cwd(), '.env.local');
const envPath = resolve(process.cwd(), '.env');

if (existsSync(envProdLocalPath)) {
  dotenv.config({ path: envProdLocalPath });
} else if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config({ path: envPath });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TARGET_CATEGORIES = [
  'Class II Forks', 
  'Class III Forks',
  'Class IV Forks'
];

const DRY_RUN = process.argv.includes('--dry-run');

// Helper to convert fractions to decimals
function parseFraction(str: string): number {
  if (!str) return 0;
  
  // Handle whole numbers (e.g., "4")
  if (!str.includes(' ') && !str.includes('/')) {
    return parseFloat(str);
  }
  
  const parts = str.trim().split(' ');
  let whole = 0;
  let fraction = str;
  
  if (parts.length > 1) {
    whole = parseFloat(parts[0]);
    fraction = parts[1];
  } else if (!fraction.includes('/')) {
    return parseFloat(str);
  }
  
  const [num, den] = fraction.split('/').map(n => parseFloat(n));
  return whole + (num / den);
}

async function main() {
  console.log('\n=================================================');
  console.log(DRY_RUN ? '🔍 DRY RUN MODE - No changes will be made' : '🚀 LIVE MODE - Updating product specs');
  console.log('=================================================\n');

  // 1. Fetch products
  const { data: products, error } = await supabase
    .from('parts')
    .select('*')
    .in('category', TARGET_CATEGORIES);

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Found ${products.length} fork products to process.\n`);

  let successCount = 0;
  let errorCount = 0;
  const results = [];

  // 2. Process each product
  for (const product of products) {
    try {
      const metadata = typeof product.metadata === 'string' 
        ? JSON.parse(product.metadata) 
        : product.metadata || {};
        
      const dimensionsStr = metadata.specifications?.dimensions;
      
      if (!dimensionsStr) {
        console.warn(`⚠️ SKU ${product.sku}: No dimensions found in metadata`);
        errorCount++;
        continue;
      }

      // Parse "1 1/2X4X42" or "1 3/4X5X48"
      // Regex looks for: (Thickness) X (Width) X (Length)
      // Matches fractions like "1 1/2" or whole numbers "2"
      const dimensionRegex = /^([\d\s/]+)X([\d\s/]+)X([\d\s/]+)/i;
      const match = dimensionsStr.trim().match(dimensionRegex);

      if (!match) {
        console.warn(`⚠️ SKU ${product.sku}: Could not parse dimensions string "${dimensionsStr}"`);
        errorCount++;
        continue;
      }

      const thickness = parseFraction(match[1]);
      const width = parseFraction(match[2]);
      const length = parseFraction(match[3]);

      const newSpecs = {
        thickness,
        width,
        length,
        weight_lbs: 0 // Placeholder
      };

      if (DRY_RUN) {
        console.log(`✓ SKU ${product.sku}: "${dimensionsStr}" -> T:${thickness}" W:${width}" L:${length}"`);
      } else {
        // Update database
        const updatedMetadata = {
          ...metadata,
          specs_structured: newSpecs
        };

        const { error: updateError } = await supabase
          .from('parts')
          .update({ metadata: updatedMetadata })
          .eq('id', product.id);

        if (updateError) throw updateError;
        console.log(`✅ Updated SKU ${product.sku}`);
      }

      results.push({
        sku: product.sku,
        original: dimensionsStr,
        parsed: newSpecs
      });
      successCount++;

    } catch (err) {
      console.error(`❌ Error processing SKU ${product.sku}:`, err);
      errorCount++;
    }
  }

  // 3. Report results
  console.log('\n=================================================');
  console.log(`Total: ${products.length}`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  
  if (!DRY_RUN) {
    writeFileSync('logs/fork-specs-migration.json', JSON.stringify(results, null, 2));
    console.log('📄 Log saved to logs/fork-specs-migration.json');
  }
}

main();
