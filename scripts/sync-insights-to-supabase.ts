import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const insightsDirectory = path.join(process.cwd(), 'content/insights');

async function syncInsightsToSupabase() {
  try {
    // Get all MDX files
    const files = fs.readdirSync(insightsDirectory)
      .filter(file => file.endsWith('.mdx'));

    console.log(`Found ${files.length} MDX files to sync`);

    for (const file of files) {
      const filePath = path.join(insightsDirectory, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const { data, content: mdxContent } = matter(content);
      const slug = file.replace(/\.mdx$/, '');

      // Prepare the insight data
      const insight = {
        slug,
        title: data.title,
        description: data.description,
        date: data.date,
        keywords: data.keywords || [],
        image: data.image || '/images/insights/default.jpg',
        content: mdxContent
      };

      // Upsert to Supabase
      const { error } = await supabase
        .from('insights')
        .upsert(insight, { onConflict: 'slug' });

      if (error) {
        console.error(`❌ Error syncing ${slug}:`, error);
      } else {
        console.log(`✅ Synced ${slug}`);
      }
    }

    console.log('✅ Finished syncing insights to Supabase');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

syncInsightsToSupabase(); 