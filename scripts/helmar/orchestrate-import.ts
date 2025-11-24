/**
 * Orchestrates the complete Helmar parts import process
 * Run this script to scrape, transform, and import all Helmar rug ram products
 */

import { processScrapedData, saveScrapedData, getPartNumbers } from './scrape-rug-rams';
import { generatePartNumbers } from '@/lib/parts/generatePartNumber';

// Note: This script coordinates the process but Firecrawl MCP scraping
// must be done interactively through Cursor due to MCP limitations

const SCRAPED_PRODUCTS_DATA = [
  {
    partNumber: 'FM-1-200',
    markdown: `# FORK MT RUG RAM (10X2 1/2)
Warranty: 1 Year
Part No: FM-1-200
| Diameter | Base Size | Effective Length | Capacity | Weight |
| 2.5" | 543\\*116\\*1040 (MM) | 10 feet | 1500kg @ 500mm | 163kg |
![FORK MT RUG RAM](https://www.helmarparts.info/Products/FM-1-200_xr.jpg)`
  },
  {
    partNumber: 'FM-1-300',
    markdown: `# FORK MT RUG RAM (10X2 3/4)
Warranty: 1 Year
Part No: FM-1-300
| Diameter | Base Size | Effective Length | Capacity | Weight |
| 2.75" | 543\\*116\\*1040 (MM) | 10 feet | 2000kg @ 500mm | 190kg |
![FORK MT RUG RAM](https://www.helmarparts.info/Products/FM-1-200_xr.jpg)`
  },
  {
    partNumber: 'FM-1-400',
    markdown: `# FORK MT RUG RAM (12X2 1/2)
Warranty: 1 Year
Part No: FM-1-400
| Diameter | Base Size | Effective Length | Capacity | Weight |
| 2.5" | 543\\*116\\*1040 (MM) | 12 feet | 1500kg @ 500mm | 205kg |
![FORK MT RUG RAM](https://www.helmarparts.info/Products/FM-1-200_xr.jpg)`
  },
  {
    partNumber: 'FM-1-500',
    markdown: `# FORK MT RUG RAM (12X2 3/4)
Warranty: 1 Year
Part No: FM-1-500
| Diameter | Base Size | Effective Length | Capacity | Weight |
| 2.75" | 543\\*126\\*1040 (MM) | 12 feet | 2000kg @ 500mm | 222kg |
![FORK MT RUG RAM](https://www.helmarparts.info/Products/FM-1-200_xr.jpg)`
  }
  // Add remaining products after scraping
];

async function main() {
  console.log('🚀 Starting Helmar parts import orchestration...\n');
  
  // Step 1: Process scraped data
  console.log('📊 Processing scraped data...');
  const products = await processScrapedData(SCRAPED_PRODUCTS_DATA);
  
  // Step 2: Save to file
  const outputPath = 'scripts/helmar/data/scraped-products.json';
  saveScrapedData(products, outputPath);
  
  // Step 3: Generate internal part numbers
  console.log('\n🔢 Generating internal part numbers...');
  const internalSkus = await generatePartNumbers(products.length, 'FEE-RC');
  console.log(`Generated: ${internalSkus.join(', ')}`);
  
  console.log('\n✅ Orchestration complete!');
  console.log('\nNext steps:');
  console.log('1. Review scraped-products.json');
  console.log('2. Run image download script');
  console.log('3. Run database insertion script');
}

if (require.main === module) {
  main().catch(console.error);
}

export { SCRAPED_PRODUCTS_DATA };

