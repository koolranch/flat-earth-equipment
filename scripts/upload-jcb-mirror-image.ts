/**
 * Upload JCB Mirror image to Supabase Storage and update parts record
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

const SKU = '33163982';
const IMAGE_FILENAME = 'jcb-331-63982-exterior-mirror.png';
const LOCAL_IMAGE_PATH = path.join(process.cwd(), 'public', 'images', 'products', IMAGE_FILENAME);
const BUCKET_NAME = 'products';

async function uploadImage() {
  console.log('🖼️  JCB Mirror Image Upload Script\n');

  if (!fs.existsSync(LOCAL_IMAGE_PATH)) {
    console.error(`❌ Image file not found at: ${LOCAL_IMAGE_PATH}`);
    process.exit(1);
  }

  try {
    const imageBuffer = fs.readFileSync(LOCAL_IMAGE_PATH);
    console.log(`📁 Found image: ${LOCAL_IMAGE_PATH}`);

    console.log('⬆️  Uploading to Supabase Storage...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(IMAGE_FILENAME, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(IMAGE_FILENAME);

    console.log(`🔗 Public URL: ${publicUrl}`);

    const { error: updateError } = await supabase
      .from('parts')
      .update({ image_url: publicUrl })
      .eq('sku', SKU);

    if (updateError) throw updateError;

    console.log('✅ Updated parts record with image URL');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

uploadImage();
