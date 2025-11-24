import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Helmar dealer pricing from screenshot (40% markup for retail)
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

const MARKUP = 1.40; // 40% markup

export interface HelmarProduct {
  helmarPartNumber: string;
  productName: string;
  dealerPrice: number;
  retailPrice: number;
  specifications: {
    diameter?: string;
    baseSize?: string;
    effectiveLength?: string;
    capacity?: string;
    weight?: string;
  };
  imageUrls: string[];
  warranty: string;
  productUrl: string;
}

/**
 * Parse the scraped markdown to extract product details
 */
function parseProductDetails(markdown: string, partNumber: string): HelmarProduct {
  const lines = markdown.split('\n');
  
  // Extract product name (appears as # heading)
  const nameMatch = markdown.match(/# ([^\n]+)/);
  const productName = nameMatch ? nameMatch[1].trim() : '';
  
  // Extract warranty info
  const warrantyMatch = markdown.match(/Warranty:\s*([^\n]+)/);
  const warranty = warrantyMatch ? warrantyMatch[1].trim() : '1 Year';
  
  // Extract image URLs
  const imageUrls: string[] = [];
  const imageRegex = /https:\/\/www\.helmarparts\.info\/Products\/[^\s\)]+/g;
  const images = markdown.match(imageRegex);
  if (images) {
    // Get unique high-res images (_xr versions)
    const xrImages = images.filter(url => url.includes('_xr'));
    imageUrls.push(...new Set(xrImages));
  }
  
  // Extract specifications from table
  const specifications: HelmarProduct['specifications'] = {};
  
  // Find the specs table
  const tableMatch = markdown.match(/\| Diameter \| Base Size \| Effective Length \| Capacity \| Weight \|[\s\S]*?\| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|/);
  
  if (tableMatch) {
    specifications.diameter = tableMatch[1].trim();
    specifications.baseSize = tableMatch[2].trim();
    specifications.effectiveLength = tableMatch[3].trim();
    specifications.capacity = tableMatch[4].trim();
    specifications.weight = tableMatch[5].trim();
  }
  
  const dealerPrice = HELMAR_DEALER_PRICING[partNumber];
  const retailPrice = dealerPrice * MARKUP;
  
  return {
    helmarPartNumber: partNumber,
    productName,
    dealerPrice,
    retailPrice: parseFloat(retailPrice.toFixed(2)),
    specifications,
    imageUrls,
    warranty,
    productUrl: `https://www.helmarparts.info/ProductDetails?pn=${partNumber}`,
  };
}

/**
 * Main scraping function - note: Firecrawl MCP calls need to be done externally
 * This function processes the scraped results
 */
export async function processScrapedData(
  scrapedResults: Array<{ partNumber: string; markdown: string }>
): Promise<HelmarProduct[]> {
  const products: HelmarProduct[] = [];
  
  for (const result of scrapedResults) {
    try {
      const product = parseProductDetails(result.markdown, result.partNumber);
      products.push(product);
      console.log(`✅ Processed ${result.partNumber}: ${product.productName}`);
    } catch (error) {
      console.error(`❌ Error processing ${result.partNumber}:`, error);
    }
  }
  
  return products;
}

/**
 * Save scraped data to JSON file
 */
export function saveScrapedData(products: HelmarProduct[], outputPath: string): void {
  try {
    mkdirSync(join(process.cwd(), 'scripts/helmar/data'), { recursive: true });
    writeFileSync(outputPath, JSON.stringify(products, null, 2));
    console.log(`✅ Saved ${products.length} products to ${outputPath}`);
  } catch (error) {
    console.error('❌ Error saving data:', error);
    throw error;
  }
}

/**
 * Get list of all part numbers to scrape
 */
export function getPartNumbers(): string[] {
  return Object.keys(HELMAR_DEALER_PRICING);
}

// Export constants for use in other scripts
export { HELMAR_DEALER_PRICING, MARKUP };

