#!/usr/bin/env npx tsx
/**
 * FSIP Bulk Product Importer
 * 
 * Usage:
 *   npx tsx scripts/bulk-import.ts <CATEGORY_URL>
 *   npx tsx scripts/bulk-import.ts https://shop.fsip.biz/en/category/battery-chargers-modules-industrial-chargers
 * 
 * This script:
 * 1. Crawls the category page to find all product links
 * 2. Filters for valid product URLs
 * 3. Imports each product using the importProduct function
 * 4. Adds delays between imports to respect rate limits
 * 
 * Environment Variables Required:
 *   - FIRECRAWL_API_KEY
 *   - STRIPE_SECRET_KEY
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { importProduct, validateEnvironment, type ImportResult } from './import-fsip.js';

// Load environment variables from multiple files in priority order
// Later files override earlier ones
const envFiles = [
  '.env',
  '.env.local',
  '.env.production',
  '.env.production.local',
];

for (const envFile of envFiles) {
  const envFilePath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(envFilePath)) {
    dotenv.config({ path: envFilePath, override: true });
  }
}

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const RATE_LIMIT_DELAY_MS = 2000; // 2 seconds between imports

// Product URL patterns to match (FSIP site structure)
const PRODUCT_URL_PATTERNS = [
  /\/en\/product\//i,           // FSIP product pages
  /\/product\//i,               // Generic product pages
  /green[2468x]/i,              // GREEN series chargers in URL
  /--24-GREEN/i,                // FSIP SKU pattern in URL
];

// URLs to exclude (category pages, etc.)
const EXCLUDE_PATTERNS = [
  /\/category\//i,
  /\/categories\//i,
  /\/cart/i,
  /\/checkout/i,
  /\/account/i,
  /\/login/i,
  /\/register/i,
  /\?/,  // URLs with query strings
  /#/,   // URLs with anchors
];

// -----------------------------------------------------------------------------
// Utility Functions
// -----------------------------------------------------------------------------
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isProductUrl(url: string, baseHost: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Must be same host
    if (urlObj.host !== baseHost) {
      return false;
    }
    
    // Check exclusions first
    for (const pattern of EXCLUDE_PATTERNS) {
      if (pattern.test(url)) {
        return false;
      }
    }
    
    // Check if matches any product pattern
    for (const pattern of PRODUCT_URL_PATTERNS) {
      if (pattern.test(url)) {
        return true;
      }
    }
    
    return false;
  } catch {
    return false;
  }
}

// -----------------------------------------------------------------------------
// Firecrawl Map/Crawl to Find Product URLs
// -----------------------------------------------------------------------------
async function findProductUrls(categoryUrl: string): Promise<string[]> {
  if (!FIRECRAWL_API_KEY) {
    throw new Error('FIRECRAWL_API_KEY environment variable is not set');
  }

  console.log(`🔍 Mapping category page: ${categoryUrl}`);
  
  const baseHost = new URL(categoryUrl).host;

  // First, try the map endpoint to get all URLs
  const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({
      url: categoryUrl,
      includeSubdomains: false,
      limit: 500,
    }),
  });

  if (!mapResponse.ok) {
    const errorText = await mapResponse.text();
    console.error(`❌ Firecrawl Map API error: ${mapResponse.status} - ${errorText}`);
    
    // Fallback to scrape and extract links
    console.log('📋 Falling back to scrape method...');
    return await findProductUrlsViaScrape(categoryUrl, baseHost);
  }

  const mapResult = await mapResponse.json();
  
  if (!mapResult.success || !mapResult.links) {
    console.log('⚠️  Map returned no links, trying scrape fallback...');
    return await findProductUrlsViaScrape(categoryUrl, baseHost);
  }

  const allUrls: string[] = mapResult.links.map((l: { url: string }) => l.url || l);
  console.log(`📋 Found ${allUrls.length} total URLs from map`);

  // Filter for product URLs
  const productUrls = allUrls.filter(url => isProductUrl(url, baseHost));
  
  // If map didn't find enough product URLs, try scrape fallback
  if (productUrls.length < 3) {
    console.log('⚠️  Map found too few products, trying scrape fallback...');
    return await findProductUrlsViaScrape(categoryUrl, baseHost);
  }
  
  // Deduplicate
  const uniqueUrls = [...new Set(productUrls)];
  
  console.log(`✅ Filtered to ${uniqueUrls.length} product URLs`);
  
  return uniqueUrls;
}

async function findProductUrlsViaScrape(categoryUrl: string, baseHost: string): Promise<string[]> {
  const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({
      url: categoryUrl,
      formats: ['links', 'html'],
    }),
  });

  if (!scrapeResponse.ok) {
    const errorText = await scrapeResponse.text();
    throw new Error(`Firecrawl Scrape API error: ${scrapeResponse.status} - ${errorText}`);
  }

  const scrapeResult = await scrapeResponse.json();
  
  if (!scrapeResult.success) {
    throw new Error('Firecrawl scrape failed');
  }

  const links: string[] = scrapeResult.data?.links || [];
  const html: string = scrapeResult.data?.html || '';

  // Also extract links from HTML directly
  const hrefMatches = html.matchAll(/href=["']([^"']+)["']/gi);
  for (const match of hrefMatches) {
    let href = match[1];
    // Make relative URLs absolute
    if (href.startsWith('/')) {
      href = `https://${baseHost}${href}`;
    }
    if (!links.includes(href)) {
      links.push(href);
    }
  }

  console.log(`📋 Found ${links.length} total links from scrape`);

  // Filter for product URLs
  const productUrls = links.filter(url => isProductUrl(url, baseHost));
  
  // Deduplicate
  const uniqueUrls = [...new Set(productUrls)];
  
  console.log(`✅ Filtered to ${uniqueUrls.length} product URLs`);
  
  return uniqueUrls;
}

// -----------------------------------------------------------------------------
// Main Bulk Import
// -----------------------------------------------------------------------------
async function bulkImport(categoryUrl: string) {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  FSIP Bulk Product Importer');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Category URL: ${categoryUrl}`);
  console.log(`  Rate Limit: ${RATE_LIMIT_DELAY_MS}ms between imports`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  // Step 1: Find all product URLs
  const productUrls = await findProductUrls(categoryUrl);
  
  if (productUrls.length === 0) {
    console.error('❌ No product URLs found. Check if the URL patterns match the site structure.');
    console.log('');
    console.log('💡 Tips:');
    console.log('   - Verify the category URL is correct');
    console.log('   - Check if products have a different URL structure');
    console.log('   - The site may require authentication or have bot protection');
    process.exit(1);
  }

  console.log('');
  console.log(`📦 Found ${productUrls.length} products in category.`);
  console.log('');
  console.log('Product URLs to import:');
  productUrls.slice(0, 10).forEach((url, i) => console.log(`  ${i + 1}. ${url}`));
  if (productUrls.length > 10) {
    console.log(`  ... and ${productUrls.length - 10} more`);
  }
  console.log('');

  // Step 2: Import each product
  const results: { url: string; result: ImportResult }[] = [];
  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Starting Import');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  for (let i = 0; i < productUrls.length; i++) {
    const url = productUrls[i];
    const progress = `[${i + 1}/${productUrls.length}]`;
    
    console.log(`📥 Processing ${progress}: ${url}`);
    
    try {
      const result = await importProduct(url, { silent: true });
      results.push({ url, result });
      
      if (result.success) {
        successCount++;
        console.log(`   ✅ Imported [${result.sku}]: Sell $${result.sellPrice?.toFixed(2) || 'N/A'} / Cost $${result.costEstimate?.toFixed(2) || 'N/A'} / Stripe ID: ${result.stripeId || 'N/A'}`);
      } else {
        if (result.error?.includes('SKU')) {
          skipCount++;
          console.log(`   ⚠️  Skipped: ${result.error}`);
        } else {
          failCount++;
          console.log(`   ❌ Failed: ${result.error}`);
        }
      }
    } catch (error) {
      failCount++;
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`   ❌ Error: ${errorMsg}`);
      results.push({ 
        url, 
        result: { 
          success: false, 
          sku: null, 
          name: null, 
          sellPrice: null, 
          costEstimate: null, 
          stripeId: null, 
          error: errorMsg 
        } 
      });
    }

    // Rate limit delay (skip on last item)
    if (i < productUrls.length - 1) {
      await sleep(RATE_LIMIT_DELAY_MS);
    }
  }

  // Final Summary
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Import Complete!');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  ✅ Successful: ${successCount}`);
  console.log(`  ⚠️  Skipped:    ${skipCount}`);
  console.log(`  ❌ Failed:     ${failCount}`);
  console.log(`  📦 Total:      ${productUrls.length}`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  // List failures for debugging
  const failures = results.filter(r => !r.result.success && !r.result.error?.includes('SKU'));
  if (failures.length > 0) {
    console.log('Failed imports:');
    failures.forEach(f => {
      console.log(`  - ${f.url}`);
      console.log(`    Error: ${f.result.error}`);
    });
    console.log('');
  }
}

// -----------------------------------------------------------------------------
// CLI Entry Point
// -----------------------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error(`
Usage: npx tsx scripts/bulk-import.ts <CATEGORY_URL>

Examples:
  npx tsx scripts/bulk-import.ts https://shop.fsip.biz/en/category/battery-chargers-modules-industrial-chargers
  npx tsx scripts/bulk-import.ts https://shop.fsip.biz/en/category/battery-chargers-modules

This script will:
  1. Crawl the category page to find all product URLs
  2. Filter for valid product pages
  3. Import each product with a 2-second delay between imports
`);
    process.exit(1);
  }

  const categoryUrl = args[0];

  // Validate URL
  try {
    new URL(categoryUrl);
  } catch {
    console.error(`❌ Invalid URL: ${categoryUrl}`);
    process.exit(1);
  }

  // Validate environment
  const missingVars = validateEnvironment();
  if (missingVars.length > 0) {
    console.error(`❌ Missing environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }

  try {
    await bulkImport(categoryUrl);
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('  ❌ Bulk Import Failed');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error(error);
    process.exit(1);
  }
}

main();

