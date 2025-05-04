// Simple mock implementation of merchant feed builder
const fs = require('fs');
const path = require('path');

async function buildMerchantFeed() {
  try {
    // Ensure directory exists
    const feedDir = path.join(process.cwd(), 'public', 'feed');
    if (!fs.existsSync(feedDir)) {
      fs.mkdirSync(feedDir, { recursive: true });
    }
    
    // Read the CSV data 
    const csvPath = path.join(process.cwd(), 'ingest', 'parts-upload.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    
    // Create a simple JSON feed (simplified for this example)
    const feedItems = csvData.split('\n').slice(1).map(line => {
      const columns = line.split(',');
      if (columns.length < 5) return null;
      
      return {
        id: columns[0], // sku
        title: columns[1], // name
        description: columns[2], // description
        price: {
          value: columns[3], // price
          currency: 'USD'
        },
        brand: columns[4] // brand
      };
    }).filter(Boolean);
    
    // Write the feed file
    const feedPath = path.join(feedDir, 'google-merchant.json');
    fs.writeFileSync(
      feedPath, 
      JSON.stringify({ items: feedItems }, null, 2)
    );
    
    console.log(`✅ Generated merchant feed with ${feedItems.length} products`);
  } catch (error) {
    console.error('Error building merchant feed:', error);
    process.exit(1);
  }
}

buildMerchantFeed(); 