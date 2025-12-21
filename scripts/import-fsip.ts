#!/usr/bin/env npx tsx
/**
 * FSIP Product Importer
 * 
 * Usage (CLI):
 *   npx tsx scripts/import-fsip.ts <URL>
 *   npx tsx scripts/import-fsip.ts https://fsip.com/product/green4-48v-75a
 * 
 * Usage (Module):
 *   import { importProduct } from './import-fsip';
 *   await importProduct('https://fsip.com/product/green4-48v-75a');
 * 
 * This script:
 * 1. Scrapes the provided URL using Firecrawl
 * 2. Extracts product data (title, SKU, price, specs, compatibility)
 * 3. Creates/updates Stripe Product & Price
 * 4. Upserts to Supabase parts_catalog table
 * 
 * Environment Variables Required:
 *   - FIRECRAWL_API_KEY
 *   - STRIPE_SECRET_KEY
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

import Stripe from 'stripe';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from multiple files in priority order
// Later files override earlier ones
const envFiles = [
  '.env',
  '.env.local',
  '.env.production',
  '.env.production.local',
];

let loadedEnvFiles: string[] = [];
for (const envFile of envFiles) {
  const envFilePath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(envFilePath)) {
    dotenv.config({ path: envFilePath, override: true });
    loadedEnvFiles.push(envFile);
  }
}

if (loadedEnvFiles.length > 0) {
  console.log(`✅ Loaded environment from: ${loadedEnvFiles.join(', ')}`);
} else {
  console.warn('⚠️  No .env files found');
}

// -----------------------------------------------------------------------------
// Configuration & Clients (Lazy initialization for module usage)
// -----------------------------------------------------------------------------
let _stripe: Stripe | null = null;
let _supabase: SupabaseClient | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

// Pricing multipliers
const SELL_MULTIPLIER = 1.05;  // 5% markup for fees + margin
const COST_MULTIPLIER = 0.70;  // 70% of MSRP = estimated dealer cost

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
interface ExtractedProduct {
  title: string;
  sku: string | null;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  specs: Record<string, string | number>;
  compatibilityList: string[];
  oem_part_numbers: string[];
}

interface PartsCatalogRecord {
  sku: string;
  name: string;
  slug: string;
  category_type: 'charger' | 'part' | 'attachment';
  seo_title_template: string | null;
  meta_description: string | null;
  specs: Record<string, string | number>;
  compatibility_list: string[];
  oem_part_numbers: string[];
  images: string[];
  fsip_price: number | null;
  your_price: number | null;
  dealer_cost_estimate: number | null;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  source_url: string;
  in_stock: boolean;
}

// -----------------------------------------------------------------------------
// Utility Functions
// -----------------------------------------------------------------------------
function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100); // Limit slug length
}

function extractVoltageAmps(text: string): { voltage?: number; amps?: number } {
  const result: { voltage?: number; amps?: number } = {};
  
  // Match patterns like "48V", "48 V", "48 Volt", "48-Volt"
  const voltageMatch = text.match(/(\d+)\s*[-]?\s*(?:v|volt)/i);
  if (voltageMatch) {
    result.voltage = parseInt(voltageMatch[1], 10);
  }
  
  // Match patterns like "75A", "75 A", "75 Amp", "75-Amp"
  const ampsMatch = text.match(/(\d+)\s*[-]?\s*(?:a|amp)/i);
  if (ampsMatch) {
    result.amps = parseInt(ampsMatch[1], 10);
  }
  
  return result;
}

function parsePrice(priceStr: string | null | undefined): number | null {
  if (!priceStr) return null;
  
  // Remove currency symbols, commas, and whitespace
  const cleaned = priceStr.replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) || parsed <= 0 ? null : parsed;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// -----------------------------------------------------------------------------
// Firecrawl Scraping
// -----------------------------------------------------------------------------
async function scrapeWithFirecrawl(url: string): Promise<ExtractedProduct | null> {
  if (!FIRECRAWL_API_KEY) {
    throw new Error('FIRECRAWL_API_KEY environment variable is not set');
  }

  console.log(`🔍 Scraping URL: ${url}`);
  
  // Use Firecrawl extract endpoint for structured data
  const extractResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({
      url,
      formats: ['markdown', 'html'],
      onlyMainContent: true,
    }),
  });

  if (!extractResponse.ok) {
    const errorText = await extractResponse.text();
    console.error(`❌ Firecrawl API error: ${extractResponse.status} - ${errorText}`);
    return null;
  }

  const scrapeResult = await extractResponse.json();
  
  if (!scrapeResult.success) {
    console.error('❌ Firecrawl scrape failed:', scrapeResult);
    return null;
  }

  const { markdown, metadata, html } = scrapeResult.data || {};
  const content = markdown || '';
  const pageTitle = metadata?.title || '';

  // Extract data from scraped content
  const product = extractProductFromContent(content, html || '', pageTitle, url);
  
  // =========================================================================
  // IMPROVED IMAGE EXTRACTION (Priority Order)
  // =========================================================================
  let finalImageUrl: string | null = null;
  
  // Priority 1: og:image from metadata (highest quality)
  if (metadata?.ogImage) {
    finalImageUrl = metadata.ogImage;
    console.log(`   🖼️  Image Found (og:image): ${finalImageUrl}`);
  }
  
  // Priority 2: Extract from HTML meta tags
  if (!finalImageUrl && html) {
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (ogImageMatch) {
      finalImageUrl = ogImageMatch[1];
      console.log(`   🖼️  Image Found (meta og:image): ${finalImageUrl}`);
    }
  }
  
  // Priority 3: Product gallery image (FSIP uses getthumbnail pattern)
  if (!finalImageUrl && html) {
    const galleryMatch = html.match(/src=["'](https?:\/\/[^"']*getthumbnail[^"']+)["']/i);
    if (galleryMatch) {
      // Get higher resolution version by modifying the URL
      finalImageUrl = galleryMatch[1].replace(/width=\d+/, 'width=600').replace(/height=\d+/, 'height=600');
      console.log(`   🖼️  Image Found (gallery): ${finalImageUrl}`);
    }
  }
  
  // Priority 4: Any product image with common extensions
  if (!finalImageUrl && html) {
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+(?:\.jpg|\.jpeg|\.png|\.webp)[^"']*)["']/i);
    if (imgMatch && imgMatch[1]) {
      let imgUrl = imgMatch[1];
      // Make URL absolute if relative
      if (imgUrl.startsWith('/')) {
        const urlObj = new URL(url);
        imgUrl = `${urlObj.origin}${imgUrl}`;
      }
      finalImageUrl = imgUrl;
      console.log(`   🖼️  Image Found (img tag): ${finalImageUrl}`);
    }
  }
  
  if (!finalImageUrl) {
    console.log(`   ⚠️  No image found for this product`);
  }
  
  product.imageUrl = finalImageUrl;

  return product;
}

function extractProductFromContent(
  markdown: string, 
  html: string, 
  pageTitle: string,
  url: string
): ExtractedProduct {
  const combined = `${pageTitle} ${markdown}`;
  
  // Extract title (prefer page title, clean it up)
  let title = pageTitle
    .replace(/\s*[-|]\s*FSIP.*$/i, '')
    .replace(/\s*[-|]\s*Forklift.*$/i, '')
    .trim() || 'Unknown Product';

  // Extract SKU with improved logic
  let rawScrapedSku: string | null = null;
  let sku: string | null = null;
  
  // Method A: Try to find valid SKU in text (e.g., "24-GREEN4", "24-GREEN4-4875")
  const skuPatterns = [
    /(?:sku|part\s*#?|item\s*#?|model\s*#?|stock\s*code)[:\s]*([A-Z0-9][-A-Z0-9]{3,30})/i,
    /\b(\d{2,3}-GREEN[2468X][-A-Z0-9]*)\b/i,  // FSIP pattern: 24-GREEN4-4875
    /\b(GREEN[2468X][-]?\d{1,3}[-]?\d{0,3}[A-Z]?)\b/i, // GREEN4-48V-75A
  ];
  
  for (const pattern of skuPatterns) {
    const match = combined.match(pattern);
    if (match) {
      rawScrapedSku = match[1].toUpperCase();
      break;
    }
  }
  
  // Method B: Check if scraped SKU is generic/invalid - if so, ignore it
  const isGenericSku = (s: string | null): boolean => {
    if (!s) return true;
    const genericPatterns = [
      /SELECTED/i,
      /^NEW-/i,
      /\s/,           // Contains spaces
      /^[A-Z]{2,5}$/,  // Too short, just letters (like "IP54")
    ];
    return genericPatterns.some(p => p.test(s));
  };
  
  if (rawScrapedSku && !isGenericSku(rawScrapedSku)) {
    sku = rawScrapedSku;
  }
  
  // Method C (Fallback): Generate SKU from URL
  if (!sku) {
    // Try to extract from URL pattern: ...product-name--24-GREEN4 or ...product-name--24-GREEN4-4875
    const urlSkuMatch = url.match(/--([A-Z0-9][-A-Z0-9]+)$/i);
    if (urlSkuMatch) {
      sku = urlSkuMatch[1].toUpperCase();
    } else {
      // Last resort: use the last segment of the URL path as slug
      const urlPath = new URL(url).pathname;
      const lastSegment = urlPath.split('/').filter(Boolean).pop() || '';
      // Clean up the slug: remove product-name prefix if present
      const cleanedSlug = lastSegment
        .replace(/^.*--/, '')  // Remove everything before --
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, '');
      sku = cleanedSlug || toKebabCase(title).toUpperCase().replace(/-/g, '');
    }
  }
  
  // Log SKU extraction for debugging
  console.log(`   📋 SKU Extraction: Raw="${rawScrapedSku || 'none'}" → Final="${sku}"`)

  // Extract price patterns
  let price: number | null = null;
  const pricePatterns = [
    /(?:price|msrp|cost)[:\s]*\$?([\d,]+\.?\d*)/i,
    /\$\s*([\d,]+\.?\d*)/,
    /(?:USD|US\$)\s*([\d,]+\.?\d*)/i,
  ];
  
  for (const pattern of pricePatterns) {
    const match = combined.match(pattern);
    if (match) {
      price = parsePrice(match[1]);
      if (price && price > 50 && price < 50000) { // Sanity check
        break;
      }
      price = null;
    }
  }

  // Extract voltage/amps from title or content
  const voltageAmps = extractVoltageAmps(combined);
  const specs: Record<string, string | number> = {};
  
  if (voltageAmps.voltage) specs['Voltage'] = `${voltageAmps.voltage}V`;
  if (voltageAmps.amps) specs['Amperage'] = `${voltageAmps.amps}A`;

  // Extract phase information
  const phaseMatch = combined.match(/(?:single|1|one)[\s-]*phase/i);
  const threePhaseMatch = combined.match(/(?:three|3)[\s-]*phase/i);
  if (threePhaseMatch) {
    specs['Phase'] = '3P';
  } else if (phaseMatch) {
    specs['Phase'] = '1P';
  }

  // Extract chemistry support
  if (/lithium/i.test(combined)) specs['Lithium Compatible'] = 'Yes';
  if (/lead[\s-]*acid/i.test(combined)) specs['Lead-Acid Compatible'] = 'Yes';
  if (/agm/i.test(combined)) specs['AGM Compatible'] = 'Yes';
  if (/gel/i.test(combined)) specs['Gel Compatible'] = 'Yes';

  // Extract compatibility list (look for machine models)
  const compatibilityList: string[] = [];
  const compatPatterns = [
    /(?:compatible|fits|works with|for)[:\s]*([^\n.]+)/gi,
    /(?:crown|toyota|yale|hyster|raymond|cat|caterpillar|nissan|clark|komatsu)\s*[A-Z0-9-]+/gi,
  ];
  
  for (const pattern of compatPatterns) {
    const matches = combined.matchAll(pattern);
    for (const match of matches) {
      const model = match[1] || match[0];
      if (model && model.length < 100) {
        const cleaned = model.trim().replace(/[,;]$/, '');
        if (cleaned && !compatibilityList.includes(cleaned)) {
          compatibilityList.push(cleaned);
        }
      }
    }
  }

  // Extract OEM part numbers
  const oem_part_numbers: string[] = [];
  const oemPatterns = [
    /(?:oem|original|replacement|cross[\s-]*ref)[:\s#]*([A-Z0-9][-A-Z0-9]{4,25})/gi,
  ];
  
  for (const pattern of oemPatterns) {
    const matches = combined.matchAll(pattern);
    for (const match of matches) {
      const partNum = match[1].toUpperCase();
      if (partNum && !oem_part_numbers.includes(partNum) && partNum !== sku) {
        oem_part_numbers.push(partNum);
      }
    }
  }

  // =========================================================================
  // GENERATE CLEAN DESCRIPTION (instead of scraping messy page text)
  // =========================================================================
  // Template: "Genuine FSIP ${name}. Industrial quality replacement. Fits: X, Y, Z. Ships from USA."
  let description: string | null = null;
  
  const fitsText = compatibilityList.length > 0 
    ? ` Fits: ${compatibilityList.slice(0, 5).join(', ')}${compatibilityList.length > 5 ? '...' : ''}.`
    : '';
  
  const specsText = Object.entries(specs).length > 0
    ? ` Specs: ${Object.entries(specs).map(([k, v]) => `${k}: ${v}`).slice(0, 3).join(', ')}.`
    : '';
  
  description = `Genuine FSIP ${title}. Industrial quality battery charger for forklifts and material handling equipment.${specsText}${fitsText} Ships from USA.`.substring(0, 500);

  // Extract image URL from HTML
  let imageUrl: string | null = null;
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+(?:\.jpg|\.jpeg|\.png|\.webp)[^"']*)["']/i);
  if (imgMatch) {
    imageUrl = imgMatch[1];
    // Make URL absolute if relative
    if (imageUrl.startsWith('/')) {
      const urlObj = new URL(url);
      imageUrl = `${urlObj.origin}${imageUrl}`;
    }
  }

  return {
    title,
    sku,
    description,
    imageUrl,
    price,
    specs,
    compatibilityList,
    oem_part_numbers,
  };
}

// -----------------------------------------------------------------------------
// Stripe Integration
// -----------------------------------------------------------------------------
async function findOrCreateStripeProduct(
  product: ExtractedProduct,
  sourceUrl: string
): Promise<{ productId: string; priceId: string } | null> {
  if (!product.price) {
    console.log('⚠️  No price found, skipping Stripe product creation');
    return null;
  }

  const sellPrice = Math.round(product.price * SELL_MULTIPLIER * 100); // Convert to cents

  // Search for existing product by SKU in metadata
  console.log(`🔎 Searching for existing Stripe product with SKU: ${product.sku}`);
  
  const stripe = getStripe();
  
  const existingProducts = await stripe.products.search({
    query: `metadata['sku']:'${product.sku}'`,
    limit: 1,
  });

  if (existingProducts.data.length > 0) {
    const existingProduct = existingProducts.data[0];
    console.log(`✅ Found existing Stripe product: ${existingProduct.id}`);
    
    // Get the active price
    const prices = await stripe.prices.list({
      product: existingProduct.id,
      active: true,
      limit: 1,
    });

    if (prices.data.length > 0) {
      const existingPrice = prices.data[0];
      
      // Check if price matches, if not create a new price
      if (existingPrice.unit_amount === sellPrice) {
        console.log(`✅ Using existing price: ${existingPrice.id}`);
        return { productId: existingProduct.id, priceId: existingPrice.id };
      }
      
      // Deactivate old price and create new one
      await stripe.prices.update(existingPrice.id, { active: false });
    }
    
    // Create new price for existing product
    const newPrice = await stripe.prices.create({
      product: existingProduct.id,
      currency: 'usd',
      unit_amount: sellPrice,
    });
    
    console.log(`✅ Created new price: ${newPrice.id} for $${(sellPrice / 100).toFixed(2)}`);
    return { productId: existingProduct.id, priceId: newPrice.id };
  }

  // Create new product
  console.log(`🆕 Creating new Stripe product: ${product.title}`);
  
  const stripeProduct = await stripe.products.create({
    name: product.title,
    description: product.description || undefined,
    images: product.imageUrl ? [product.imageUrl] : undefined,
    metadata: {
      sku: product.sku!,
      fsip_url: sourceUrl,
      category: 'charger',
    },
  });

  const stripePrice = await stripe.prices.create({
    product: stripeProduct.id,
    currency: 'usd',
    unit_amount: sellPrice,
  });

  console.log(`✅ Created Stripe product: ${stripeProduct.id}`);
  console.log(`✅ Created Stripe price: ${stripePrice.id} for $${(sellPrice / 100).toFixed(2)}`);

  return { productId: stripeProduct.id, priceId: stripePrice.id };
}

// -----------------------------------------------------------------------------
// Supabase Upsert
// -----------------------------------------------------------------------------
async function upsertToPartsCatalog(
  product: ExtractedProduct,
  stripeData: { productId: string; priceId: string } | null,
  sourceUrl: string
): Promise<void> {
  const sellPrice = product.price ? product.price * SELL_MULTIPLIER : null;
  const costEstimate = product.price ? product.price * COST_MULTIPLIER : null;

  const record: PartsCatalogRecord = {
    sku: product.sku!,
    name: product.title,
    slug: toKebabCase(product.title),
    category_type: 'charger',
    seo_title_template: 'FSIP GREEN Series Charger',
    meta_description: product.description,
    specs: product.specs,
    compatibility_list: product.compatibilityList,
    oem_part_numbers: product.oem_part_numbers,
    images: product.imageUrl ? [product.imageUrl] : [],
    fsip_price: product.price,
    your_price: sellPrice,
    dealer_cost_estimate: costEstimate,
    stripe_price_id: stripeData?.priceId ?? null,
    stripe_product_id: stripeData?.productId ?? null,
    source_url: sourceUrl,
    in_stock: true,
  };

  console.log(`💾 Upserting to parts_catalog with SKU: ${record.sku}`);

  const supabase = getSupabase();
  const { error } = await supabase
    .from('parts_catalog')
    .upsert(record, { onConflict: 'sku' });

  if (error) {
    console.error('❌ Supabase upsert error:', error);
    throw error;
  }

  console.log(`✅ Successfully upserted: ${record.name}`);
}

// -----------------------------------------------------------------------------
// Import Result Type
// -----------------------------------------------------------------------------
export interface ImportResult {
  success: boolean;
  sku: string | null;
  name: string | null;
  sellPrice: number | null;
  costEstimate: number | null;
  stripeId: string | null;
  error?: string;
}

// -----------------------------------------------------------------------------
// Exportable Import Function (for use by bulk-import.ts)
// -----------------------------------------------------------------------------
export async function importProduct(url: string, options: { silent?: boolean } = {}): Promise<ImportResult> {
  const { silent = false } = options;
  
  const log = (...args: unknown[]) => {
    if (!silent) console.log(...args);
  };

  try {
    // Validate URL
    try {
      new URL(url);
    } catch {
      return { success: false, sku: null, name: null, sellPrice: null, costEstimate: null, stripeId: null, error: `Invalid URL: ${url}` };
    }

    // Step 1: Scrape the URL
    const product = await scrapeWithFirecrawl(url);
    
    if (!product) {
      return { success: false, sku: null, name: null, sellPrice: null, costEstimate: null, stripeId: null, error: 'Failed to extract product data' };
    }

    log(`📦 Extracted: ${product.title} (SKU: ${product.sku || 'N/A'})`);

    // Check for required data
    if (!product.sku) {
      return { success: false, sku: null, name: product.title, sellPrice: null, costEstimate: null, stripeId: null, error: 'Could not extract SKU' };
    }

    // Step 2: Stripe Integration
    let stripeData: { productId: string; priceId: string } | null = null;
    
    if (product.price) {
      stripeData = await findOrCreateStripeProduct(product, url);
    }

    // Step 3: Supabase Upsert
    await upsertToPartsCatalog(product, stripeData, url);

    const sellPrice = product.price ? product.price * SELL_MULTIPLIER : null;
    const costEst = product.price ? product.price * COST_MULTIPLIER : null;

    return {
      success: true,
      sku: product.sku,
      name: product.title,
      sellPrice,
      costEstimate: costEst,
      stripeId: stripeData?.priceId || null,
    };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return { success: false, sku: null, name: null, sellPrice: null, costEstimate: null, stripeId: null, error: errorMsg };
  }
}

// -----------------------------------------------------------------------------
// Validate Environment (exported for reuse)
// -----------------------------------------------------------------------------
export function validateEnvironment(): string[] {
  const requiredEnvVars = [
    'FIRECRAWL_API_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missing: string[] = [];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  return missing;
}

// -----------------------------------------------------------------------------
// CLI Main Script (only runs when executed directly)
// -----------------------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error(`
Usage: npx tsx scripts/import-fsip.ts <URL> [--dry-run]

Examples:
  npx tsx scripts/import-fsip.ts https://fsip.com/product/green4-48v-75a
  npx tsx scripts/import-fsip.ts https://fsip.com/product/green4-48v-75a --dry-run

Options:
  --dry-run    Extract and display data without saving to Stripe/Supabase
`);
    process.exit(1);
  }

  const url = args[0];
  const isDryRun = args.includes('--dry-run');

  // Validate URL
  try {
    new URL(url);
  } catch {
    console.error(`❌ Invalid URL: ${url}`);
    process.exit(1);
  }

  // Validate environment
  const missingVars = validateEnvironment();
  if (missingVars.length > 0) {
    console.error(`❌ Missing environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  FSIP Product Importer');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  URL: ${url}`);
  console.log(`  Mode: ${isDryRun ? 'DRY RUN (no changes)' : 'LIVE'}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  try {
    // Step 1: Scrape the URL
    const product = await scrapeWithFirecrawl(url);
    
    if (!product) {
      console.error('❌ Failed to extract product data from URL');
      process.exit(1);
    }

    // Display extracted data
    console.log('');
    console.log('📦 Extracted Product Data:');
    console.log('───────────────────────────────────────────────────────────');
    console.log(`  Title:       ${product.title}`);
    console.log(`  SKU:         ${product.sku || '(none)'}`);
    console.log(`  Price:       ${product.price ? `$${product.price.toFixed(2)}` : '(none)'}`);
    console.log(`  Image:       ${product.imageUrl || '(none)'}`);
    console.log(`  Specs:       ${JSON.stringify(product.specs)}`);
    console.log(`  Compat:      ${product.compatibilityList.length} items`);
    console.log(`  OEM Parts:   ${product.oem_part_numbers.join(', ') || '(none)'}`);
    console.log('───────────────────────────────────────────────────────────');
    console.log('');

    // Check for required data
    if (!product.sku) {
      console.error('❌ Could not extract or generate SKU. Aborting.');
      process.exit(1);
    }

    if (!product.price) {
      console.warn('⚠️  No price found - product will be imported without Stripe integration');
      console.warn('    You can add the price manually later in Stripe dashboard');
    }

    if (isDryRun) {
      console.log('');
      console.log('🔍 DRY RUN - Calculated values:');
      if (product.price) {
        console.log(`  MSRP (scraped):      $${product.price.toFixed(2)}`);
        console.log(`  Sell Price (×1.05):  $${(product.price * SELL_MULTIPLIER).toFixed(2)}`);
        console.log(`  Cost Est. (×0.70):   $${(product.price * COST_MULTIPLIER).toFixed(2)}`);
      }
      console.log('');
      console.log('✅ Dry run complete. No changes made.');
      return;
    }

    // Step 2: Stripe Integration
    let stripeData: { productId: string; priceId: string } | null = null;
    
    if (product.price) {
      stripeData = await findOrCreateStripeProduct(product, url);
    }

    // Step 3: Supabase Upsert
    await upsertToPartsCatalog(product, stripeData, url);

    // Final summary
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  ✅ Import Complete!');
    console.log('═══════════════════════════════════════════════════════════');
    
    const sellPrice = product.price ? product.price * SELL_MULTIPLIER : null;
    const costEst = product.price ? product.price * COST_MULTIPLIER : null;
    
    console.log(`  ✅ Imported [${product.sku}]:`);
    console.log(`     Sell: ${sellPrice ? `$${sellPrice.toFixed(2)}` : 'N/A'}`);
    console.log(`     Cost: ${costEst ? `$${costEst.toFixed(2)}` : 'N/A'}`);
    console.log(`     Stripe ID: ${stripeData?.priceId || 'N/A'}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('  ❌ Import Failed');
    console.error('═══════════════════════════════════════════════════════════');
    console.error(error);
    process.exit(1);
  }
}

// Only run main() when this file is executed directly (not imported)
const isMainModule = process.argv[1]?.includes('import-fsip');
if (isMainModule) {
  main();
}

