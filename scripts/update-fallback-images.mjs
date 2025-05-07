import { createClient } from '@supabase/supabase-js';
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

const updateFallbackImages = async () => {
  try {
    // Update all parts that have null or empty image_url
    const { error: updateError } = await supabase
      .from('parts')
      .update({ image_url: '/images/parts/placeholder.jpg' })
      .or('image_url.is.null,image_url.eq.""');

    if (updateError) {
      throw updateError;
    }

    // Verify the update
    const { data: parts, error: selectError } = await supabase
      .from('parts')
      .select('slug, image_url')
      .or('image_url.is.null,image_url.eq.""');

    if (selectError) {
      throw selectError;
    }

    if (parts && parts.length > 0) {
      console.log('⚠️ Some parts still have missing image_url:');
      parts.forEach(part => {
        console.log(`• ${part.slug}`);
      });
    } else {
      console.log('✅ All parts now have valid image_url values');
    }
  } catch (error) {
    console.error('❌ Error updating fallback images:', error);
    process.exit(1);
  }
};

updateFallbackImages(); 