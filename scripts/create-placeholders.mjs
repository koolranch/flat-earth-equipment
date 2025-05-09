import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

const BUCKET_NAME = 'placeholders';

// Create a simple SVG placeholder
const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="800" version="1.1" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="800" fill="#f3f4f6"/>
  <text x="400" y="400" text-anchor="middle" font-family="Arial" font-size="48" fill="#9ca3af">
    <tspan x="400" y="380">🔧</tspan>
    <tspan x="400" y="440">No Image Available</tspan>
  </text>
</svg>`;

async function createPlaceholders() {
  try {
    // 1. Create the bucket if it doesn't exist
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();

    if (listError) throw listError;

    const bucketExists = buckets.some(b => b.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.log('Creating placeholders bucket...');
      const { error: createError } = await supabase
        .storage
        .createBucket(BUCKET_NAME, {
          public: true,
          fileSizeLimit: 1024 * 1024 * 2, // 2MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
        });

      if (createError) throw createError;
      console.log('✅ Created placeholders bucket');
    } else {
      console.log('✅ placeholders bucket already exists');
    }

    // 2. Create a temporary file
    const tempFile = path.join(process.cwd(), 'default-product.svg');
    fs.writeFileSync(tempFile, svgContent);

    // 3. Upload the default product image
    const { error: uploadError } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload('default-product.jpg', fs.readFileSync(tempFile), {
        contentType: 'image/svg+xml',
        upsert: true
      });

    // Clean up temp file
    fs.unlinkSync(tempFile);

    if (uploadError) {
      throw uploadError;
    }

    console.log('✅ Uploaded default product image');

    // 4. Get and log the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl('default-product.jpg');

    console.log('Public URL:', publicUrl);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createPlaceholders(); 