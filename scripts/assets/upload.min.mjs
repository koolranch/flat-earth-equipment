import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadFile } from './uploader.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../');

function loadConfig() {
  const p = path.join(__dirname, 'assets.config.json');
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function guessContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  return 'application/octet-stream';
}

async function main() {
  const config = loadConfig();
  const bucket = process.env.ASSET_BUCKET || 'public-assets';
  
  console.log(`[assets:upload] Uploading ${config.assets.length} assets to bucket: ${bucket}`);
  
  let uploaded = 0;
  let errors = 0;
  
  for (const asset of config.assets) {
    const localPath = path.join(root, asset.outPath);
    
    // Check if local file exists
    if (!fs.existsSync(localPath)) {
      console.log(`[skip] ${asset.id} - local file missing: ${asset.outPath}`);
      continue;
    }
    
    const uploadPath = asset.uploadPath;
    const contentType = guessContentType(localPath);
    
    try {
      await uploadFile({
        bucket,
        fromPath: localPath,
        toPath: uploadPath,
        contentType
      });
      console.log(`[uploaded] ${asset.id} → ${uploadPath}`);
      uploaded++;
    } catch (error) {
      console.error(`[error] ${asset.id}:`, error.message);
      errors++;
    }
  }
  
  console.log(`\n[summary] Uploaded: ${uploaded}, Errors: ${errors}, Total: ${config.assets.length}`);
  
  if (errors > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[fatal]', err);
  process.exit(1);
});
