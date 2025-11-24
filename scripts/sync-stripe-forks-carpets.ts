import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Load environment variables - try production.local first (has service role key), then .env.local, then .env
const envProdLocalPath = resolve(process.cwd(), '.env.production.local');
const envLocalPath = resolve(process.cwd(), '.env.local');
const envPath = resolve(process.cwd(), '.env');

if (existsSync(envProdLocalPath)) {
  dotenv.config({ path: envProdLocalPath });
} else if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

// Verify required env vars
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment');
  process.exit(1);
}
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not found in environment');
  process.exit(1);
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TARGET_CATEGORIES = [
  'forks',
  'Class II Forks', 
  'Class III Forks',
  'Class IV Forks',
  'Rug / Carpet Rams'
];

const DRY_RUN = process.argv.includes('--dry-run');

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stripe_price_id: string | null;
}

interface SyncResult {
  sku: string;
  name: string;
  category: string;
  price: number;
  stripe_product_id?: string;
  stripe_price_id?: string;
  status: 'success' | 'error' | 'skipped';
  error?: string;
}

async function main() {
  console.log('\n=================================================');
  console.log(DRY_RUN ? '🔍 DRY RUN MODE - No changes will be made' : '🚀 LIVE MODE - Creating Stripe products');
  console.log('=================================================\n');

  // Query products that need Stripe IDs
  console.log('📋 Querying products...');
  const { data: products, error: queryError } = await supabase
    .from('parts')
    .select('id, sku, name, description, price, category, stripe_price_id')
    .in('category', TARGET_CATEGORIES)
    .is('stripe_price_id', null);

  if (queryError) {
    console.error('❌ Database query error:', queryError);
    process.exit(1);
  }

  if (!products || products.length === 0) {
    console.log('✅ No products need Stripe IDs. All done!');
    return;
  }

  console.log(`\n📦 Found ${products.length} products needing Stripe integration:\n`);
  
  // Group by category for display
  const byCategory = products.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, Product[]>);

  Object.keys(byCategory).forEach(cat => {
    console.log(`  ${cat}: ${byCategory[cat].length} products`);
  });

  if (DRY_RUN) {
    console.log('\n📋 Products that would be synced:\n');
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.sku} - ${p.name}`);
      console.log(`   Category: ${p.category}`);
      console.log(`   Price: $${p.price.toFixed(2)}\n`);
    });
    console.log(`\n✅ Dry run complete. ${products.length} products ready to sync.`);
    console.log('Run without --dry-run to execute.\n');
    return;
  }

  // LIVE MODE - Create Stripe products and update database
  console.log('\n🔄 Creating Stripe products...\n');
  
  const results: SyncResult[] = [];
  let successCount = 0;
  let errorCount = 0;

  for (const product of products) {
    try {
      console.log(`Processing: ${product.sku} - ${product.name}...`);
      
      // Create Stripe Product
      const stripeProduct = await stripe.products.create({
        name: product.name,
        description: product.description || `${product.name} - Professional grade equipment`,
        metadata: { 
          sku: product.sku,
          category: product.category,
          source: 'helmar_import'
        }
      });
      
      // Create Stripe Price (convert to cents)
      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        currency: 'usd',
        unit_amount: Math.round(product.price * 100)
      });
      
      // Update database
      const { error: updateError } = await supabase
        .from('parts')
        .update({
          stripe_product_id: stripeProduct.id,
          stripe_price_id: stripePrice.id
        })
        .eq('id', product.id);
      
      if (updateError) {
        throw new Error(`Database update failed: ${updateError.message}`);
      }
      
      results.push({
        sku: product.sku,
        name: product.name,
        category: product.category,
        price: product.price,
        stripe_product_id: stripeProduct.id,
        stripe_price_id: stripePrice.id,
        status: 'success'
      });
      
      successCount++;
      console.log(`  ✅ Created: ${stripeProduct.id} / ${stripePrice.id}\n`);
      
    } catch (err) {
      errorCount++;
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error(`  ❌ Error: ${errorMsg}\n`);
      
      results.push({
        sku: product.sku,
        name: product.name,
        category: product.category,
        price: product.price,
        status: 'error',
        error: errorMsg
      });
    }
  }

  // Save results to log file
  const logData = {
    timestamp: new Date().toISOString(),
    mode: 'LIVE',
    summary: {
      total: products.length,
      success: successCount,
      errors: errorCount
    },
    results: results
  };

  writeFileSync(
    'logs/stripe-sync-forks-carpets.json',
    JSON.stringify(logData, null, 2)
  );

  // Print summary
  console.log('\n=================================================');
  console.log('📊 SYNC COMPLETE');
  console.log('=================================================');
  console.log(`Total products processed: ${products.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('\n📄 Full results saved to: logs/stripe-sync-forks-carpets.json\n');

  if (errorCount > 0) {
    console.error('⚠️  Some products failed. Review the log file for details.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

