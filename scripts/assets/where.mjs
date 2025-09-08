import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../');

function loadConfig() {
  const p = path.join(__dirname, 'assets.config.json');
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function statLocal(outPath) {
  const abs = path.join(root, outPath);
  try {
    const st = fs.statSync(abs);
    return { exists: true, abs, size: st.size };
  } catch {
    return { exists: false, abs, size: 0 };
  }
}

async function trySupabaseCheck(uploadPath, bucketGuess) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SR_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.ASSET_BUCKET || bucketGuess || 'public-assets';

  if (!SUPABASE_URL || !SR_KEY) {
    return { checked: false, reason: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY', bucket };
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SR_KEY, { auth: { persistSession: false } });

  // Try listing buckets (nice to show user what exists), tolerate failure
  let buckets = [];
  try {
    const { data } = await supabase.storage.listBuckets();
    buckets = (data || []).map(b => b.name);
  } catch {}

  // Check if file exists in bucket
  const dir = path.posix.dirname(uploadPath || '');
  const file = path.posix.basename(uploadPath || '');
  try {
    const { data: list, error } = await supabase.storage.from(bucket).list(dir === '.' ? '' : dir);
    if (error) throw error;
    const hit = (list || []).find(x => x.name === file);

    // Public URL (best-effort)
    let publicUrl = null;
    try {
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(uploadPath);
      publicUrl = pub?.publicUrl || null;
    } catch {}

    return { checked: true, bucket, buckets, exists: !!hit, object: uploadPath, publicUrl };
  } catch (e) {
    return { checked: true, bucket, buckets, exists: false, object: uploadPath, error: String(e) };
  }
}

async function run() {
  const config = loadConfig();
  const results = [];

  for (const a of config.assets) {
    const local = statLocal(a.outPath);
    const remote = await trySupabaseCheck(a.uploadPath || a.outPath.replace(/^public\//, ''), 'public-assets');
    results.push({ id: a.id, outPath: a.outPath, uploadPath: a.uploadPath || a.outPath.replace(/^public\//, ''), local, remote });
  }

  // Pretty print
  console.log('\nAsset Whereabouts Report');
  console.log('========================\n');
  for (const r of results) {
    console.log(`• ${r.id}`);
    console.log(`  - LOCAL: ${r.local.exists ? 'exists' : 'missing'} → ${r.outPath} ${r.local.exists ? `(${r.local.size} bytes)` : ''}`);
    if (!r.remote.checked) {
      console.log(`  - REMOTE: skipped (${r.remote.reason}). Bucket would be: ${r.remote.bucket}`);
    } else {
      console.log(`  - REMOTE: bucket=${r.remote.bucket} object=${r.uploadPath}`);
      console.log(`            exists=${r.remote.exists}${r.remote.publicUrl ? ` url=${r.remote.publicUrl}` : ''}`);
      if (r.remote.buckets && r.remote.buckets.length) {
        console.log(`  - BUCKETS AVAILABLE: ${r.remote.buckets.join(', ')}`);
      }
      if (r.remote.error) {
        console.log(`  - REMOTE ERROR: ${r.remote.error}`);
      }
    }
    console.log('');
  }

  // Recommendation
  const bucketEnv = process.env.ASSET_BUCKET || 'public-assets';
  console.log('Recommendation');
  console.log('--------------');
  console.log(`Set ASSET_BUCKET on Vercel to: ${bucketEnv}`);
  console.log('If you want uploads during CI/build or server functions, also ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in Vercel (Server-side only).');
  console.log('\nDone.');
}

run().catch(e => { console.error(e); process.exit(1); });
