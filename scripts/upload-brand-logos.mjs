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

const BRAND_LOGOS_DIR = '/Users/christopherray/Documents/Flat Earth/FlatEarth LLC - Images/brandimages';
const BUCKET_NAME = 'brand-logos';

async function uploadBrandLogos() {
  try {
    // 1. Create the bucket if it doesn't exist
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();

    if (listError) throw listError;

    const bucketExists = buckets.some(b => b.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.log('Creating brand-logos bucket...');
      const { error: createError } = await supabase
        .storage
        .createBucket(BUCKET_NAME, {
          public: true,
          fileSizeLimit: 1024 * 1024 * 2, // 2MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
        });

      if (createError) throw createError;
      console.log('✅ Created brand-logos bucket');
    } else {
      console.log('✅ brand-logos bucket already exists');
    }

    // 2. Read all files from the brand logos directory
    const files = fs.readdirSync(BRAND_LOGOS_DIR)
      .filter(file => !file.startsWith('.') && (file.endsWith('.webp') || file.endsWith('.png')));
    
    console.log(`Found ${files.length} brand logo files`);

    // 3. Upload each file
    for (const file of files) {
      const filePath = path.join(BRAND_LOGOS_DIR, file);
      const fileBuffer = fs.readFileSync(filePath);
      const fileName = path.basename(file);
      
      console.log(`Uploading ${fileName}...`);
      
      const { error: uploadError } = await supabase
        .storage
        .from(BUCKET_NAME)
        .upload(fileName, fileBuffer, {
          contentType: file.endsWith('.png') ? 'image/png' : 'image/webp',
          upsert: true
        });

      if (uploadError) {
        console.error(`❌ Error uploading ${fileName}:`, uploadError);
        continue;
      }

      // 4. Get the public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      // 5. Update the parts table with the brand logo URL
      const brandName = path.parse(fileName).name.toLowerCase();
      const { error: updateError } = await supabase
        .from('parts')
        .update({ brand_logo_url: publicUrl })
        .eq('brand', brandName);

      if (updateError) {
        console.error(`❌ Error updating parts for brand ${brandName}:`, updateError);
      } else {
        console.log(`✅ Updated parts with brand logo URL for ${brandName}`);
      }
    }

    console.log('✅ Finished uploading brand logos');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

uploadBrandLogos(); 