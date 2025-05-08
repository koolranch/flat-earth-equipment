import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Use the provided Supabase credentials
const supabaseUrl = 'https://mzsozezflbhebykncbmr.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16c296ZXpmbGJoZWJ5a25jYm1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjE1NjA0NCwiZXhwIjoyMDYxNzMyMDQ0fQ.GvUJhKjyn83RI1M30iqnfzSmkUVxiplhd8VIvTIMB4w';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Adjust the path as needed
const rawData = fs.readFileSync('/Users/christopherray/Documents/FSIP_CloudElectricScreenshots/cloud_electric_products.json', 'utf8');
const products = JSON.parse(rawData);

const batchSize = 100;

// Validate and transform a product before insertion
function validateProduct(product) {
  return {
    name: product.name || 'Unknown Product',
    slug: product.slug || product.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'unknown-product',
    price: parseFloat(product.price) || 0.00,
    category: product.category || 'uncategorized',
    brand: product.brand || 'unknown',
    description: product.description || '',
    sku: product.sku || `SKU-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    image_url: product.image_url || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

async function importToSupabase() {
  console.log(`🚀 Starting import of ${products.length} products...`);
  console.log('Using Supabase URL:', supabaseUrl);
  
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < products.length; i += batchSize) {
    const chunk = products.slice(i, i + batchSize);
    const validatedChunk = chunk.map(validateProduct);
    
    try {
      const { data, error } = await supabase
        .from('parts')
        .insert(validatedChunk)
        .select();

      if (error) {
        console.error(`❌ Failed to insert batch ${Math.floor(i/batchSize) + 1}:`, error);
        errorCount += chunk.length;
      } else {
        console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}: Inserted ${data.length} products`);
        successCount += data.length;
      }
    } catch (error) {
      console.error(`❌ Error processing batch ${Math.floor(i/batchSize) + 1}:`, error);
      errorCount += chunk.length;
    }

    // Add a small delay between batches to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Import Summary:');
  console.log(`Total products processed: ${products.length}`);
  console.log(`Successfully imported: ${successCount}`);
  console.log(`Failed to import: ${errorCount}`);
}

// Start the import
importToSupabase()
  .catch(error => {
    console.error('❌ Fatal error during import:', error);
    process.exit(1);
  }); 