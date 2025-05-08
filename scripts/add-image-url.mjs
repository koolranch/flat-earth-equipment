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

const addImageUrl = async () => {
  try {
    // First try to select from the table to see if image_url exists
    const { error: checkError } = await supabase
      .from('parts')
      .select('image_url')
      .limit(1);

    // If we get an error about the column not existing, we need to add it
    if (checkError && checkError.message.includes('column "image_url" does not exist')) {
      // Add the column using a direct update that will fail if column doesn't exist
      const { error: addColumnError } = await supabase
        .from('parts')
        .update({ image_url: null })
        .eq('id', 'dummy-id');

      if (addColumnError && !addColumnError.message.includes('column "image_url" of relation "parts" already exists')) {
        throw addColumnError;
      }
    }

    // Get all parts that need image URLs
    const { data: parts, error: selectError } = await supabase
      .from('parts')
      .select('id, slug')
      .is('image_url', null);

    if (selectError) {
      throw selectError;
    }

    if (parts && parts.length > 0) {
      for (const part of parts) {
        // For now, we'll use a default pattern based on the slug
        const imageUrl = `/images/parts/${part.slug}.jpg`;

        const { error: updateError } = await supabase
          .from('parts')
          .update({ image_url: imageUrl })
          .eq('id', part.id);

        if (updateError) {
          throw updateError;
        }
      }
      console.log(`✅ Updated ${parts.length} parts with image URLs`);
    } else {
      console.log('✅ No parts needed image URL updates');
    }

  } catch (error) {
    console.error('❌ Error adding image_url column:', error);
    process.exit(1);
  }
};

addImageUrl(); 