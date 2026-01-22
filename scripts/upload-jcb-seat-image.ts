/**
 * Upload JCB Seat image to Supabase Storage and update parts record
 * 
 * Usage:
 *   1. Save the product image as: public/images/products/jcb-400-h9799-suspension-seat.jpg
 *   2. Run: npx tsx scripts/upload-jcb-seat-image.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SKU = '400H9799';
const IMAGE_FILENAME = 'jcb-400-h9799-suspension-seat.jpg';
const LOCAL_IMAGE_PATH = path.join(process.cwd(), 'public', 'images', 'products', IMAGE_FILENAME);
const BUCKET_NAME = 'products';

async function uploadImage() {
  console.log('🖼️  JCB Seat Image Upload Script\n');

  // Check if image file exists
  if (!fs.existsSync(LOCAL_IMAGE_PATH)) {
    console.error(`❌ Image file not found at: ${LOCAL_IMAGE_PATH}`);
    console.log('\nPlease save the product image to this location and run again.');
    console.log('Supported formats: .jpg, .jpeg, .png, .webp');
    process.exit(1);
  }

  try {
    // Read the image file
    const imageBuffer = fs.readFileSync(LOCAL_IMAGE_PATH);
    const fileExt = path.extname(LOCAL_IMAGE_PATH).toLowerCase();
    
    // Determine content type
    const contentTypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp'
    };
    const contentType = contentTypeMap[fileExt] || 'image/jpeg';

    console.log(`📁 Found image: ${LOCAL_IMAGE_PATH}`);
    console.log(`📊 File size: ${(imageBuffer.length / 1024).toFixed(1)} KB`);
    console.log(`📄 Content type: ${contentType}\n`);

    // Upload to Supabase Storage
    console.log('⬆️  Uploading to Supabase Storage...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(IMAGE_FILENAME, imageBuffer, {
        contentType,
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log(`✅ Uploaded to storage: ${uploadData.path}`);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(IMAGE_FILENAME);

    console.log(`🔗 Public URL: ${publicUrl}\n`);

    // Update parts record with image URL
    console.log('📝 Updating parts record...');
    const { error: updateError } = await supabase
      .from('parts')
      .update({ image_url: publicUrl })
      .eq('sku', SKU);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log('✅ Updated parts record with image URL\n');

    // Verify
    const { data: part } = await supabase
      .from('parts')
      .select('name, sku, image_url')
      .eq('sku', SKU)
      .single();

    console.log('='.repeat(60));
    console.log('✅ IMAGE UPLOAD COMPLETE!');
    console.log('='.repeat(60));
    console.log(`\nProduct: ${part?.name}`);
    console.log(`SKU: ${part?.sku}`);
    console.log(`Image URL: ${part?.image_url}`);
    console.log(`\nThe product page is ready at: /parts/jcb-400-h9799-suspension-seat-vinyl`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

uploadImage();
