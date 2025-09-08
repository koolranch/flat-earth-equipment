import { createClient } from '@supabase/supabase-js';

export function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function uploadFile({ bucket, fromPath, toPath, contentType }) {
  const supabase = getClient();
  const fileData = await import('fs').then(fs => fs.readFileSync(fromPath));
  const { data, error } = await supabase.storage.from(bucket).upload(toPath, fileData, {
    upsert: true,
    contentType
  });
  if (error) throw error;
  return data;
}
