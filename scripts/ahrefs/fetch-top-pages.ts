/**
 * Ahrefs Top Pages Fetcher
 * 
 * This script fetches the top 100 pages from Ahrefs for flatearthequipment.com
 * and saves the results to ahrefs/top-pages.json
 * 
 * To run:
 * 1. Set your Ahrefs API token in .env.local: AHREFS_API_TOKEN=your_token_here
 * 2. Run with ts-node: npx ts-node scripts/ahrefs/fetch-top-pages.ts
 *    Or with Bun: bun scripts/ahrefs/fetch-top-pages.ts
 */

import { fetch } from 'undici';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '.env.local' });

const token = process.env.AHREFS_API_TOKEN;
if (!token) {
  console.error("❌ Missing Ahrefs API token in environment.");
  process.exit(1);
}
console.log("✅ Loaded AHREFS_API_TOKEN:", token.slice(0, 6) + "...");

const TARGET_DOMAIN = 'flatearthequipment.com';

interface AhrefsResponse {
  pages: Array<{
    url: string;
    traffic: number;
    traffic_value: number;
    keywords: number;
    backlinks: number;
  }>;
  meta: {
    total_pages: number;
    total_keywords: number;
    total_backlinks: number;
  };
}

async function fetchTopPages(): Promise<void> {
  try {
    console.log('Fetching top pages from Ahrefs...');
    
    // Format today's date as YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    
    const url = `https://api.ahrefs.com/v3/site-explorer/top-pages?target=flatearthequipment.com&mode=domain&limit=100&output=json&token=${token}&select=url,traffic,traffic_value,keywords,backlinks&date=${today}`;
    console.log("🔍 Requesting Ahrefs Top Pages:", url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json() as AhrefsResponse;

    if (!response.ok) {
      console.error(`❌ Fetch failed with status ${response.status}`);
      console.error("🧾 Response body:", JSON.stringify(data, null, 2));

      if (response.status === 403) {
        console.error("🚫 403 Forbidden — check if token is active and domain is accessible in Ahrefs Site Explorer.");
      }

      process.exit(1);
    }

    console.log("✅ Successfully fetched top pages:", data.pages?.length ?? "unknown count");
    
    // Create ahrefs directory if it doesn't exist
    const outputDir = join(process.cwd(), 'ahrefs');
    await mkdir(outputDir, { recursive: true });
    
    // Write the response to file
    const outputPath = join(outputDir, 'top-pages.json');
    await writeFile(outputPath, JSON.stringify(data, null, 2));
    
    console.log('✅ Successfully saved top pages to ahrefs/top-pages.json');
    console.log(`📊 Found ${data.meta.total_pages} pages with ${data.meta.total_keywords} keywords`);
    
  } catch (error) {
    console.error('❌ Error fetching top pages:', error);
    process.exit(1);
  }
}

// Run the script
fetchTopPages(); 