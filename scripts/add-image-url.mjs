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
    // Add the column
    const { error: alterError } = await supabase
      .from('parts')
      .select('id')
      .limit(1)
      .then(async () => {
        return await supabase.from('parts').update({ image_url: null }).eq('id', 'dummy-id');
      });

    if (alterError && !alterError.message.includes('column "image_url" of relation "parts" already exists')) {
      throw alterError;
    }

    // Update all rows with the image_url
    const { data: parts, error: selectError } = await supabase
      .from('parts')
      .select('id, slug')
      .is('image_url', null);

    if (selectError) {
      throw selectError;
    }

    if (parts && parts.length > 0) {
      for (const part of parts) {
        const { error: updateError } = await supabase
          .from('parts')
          .update({ image_url: `/images/parts/${part.slug}.jpg` })
          .eq('id', part.id);

        if (updateError) {
          throw updateError;
        }
      }
    }

    console.log('✅ Successfully added image_url column and updated values');
  } catch (error) {
    console.error('❌ Error adding image_url column:', error);
    process.exit(1);
  }
};

addImageUrl(); 