import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { uploadFile } from './uploader.mjs';
import { BRAND } from './brand.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../');

function loadConfig() {
  const p = path.join(__dirname, 'assets.config.json');
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function svgTemplateReplace(svg, palette) {
  return svg
    .replaceAll('{SLATE}', palette.slate)
    .replaceAll('{ORANGE}', palette.orange)
    .replaceAll('{G100}', palette.gray100)
    .replaceAll('{G200}', palette.gray200)
    .replaceAll('{G300}', palette.gray300)
    .replaceAll('{G400}', palette.gray400);
}

async function ensureDir(outPath) {
  await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
}

async function renderAsset(def, { upload }) {
  const templatePath = path.join(__dirname, 'templates', def.template);
  const raw = fs.readFileSync(templatePath, 'utf-8');
  const svg = svgTemplateReplace(raw, BRAND);

  const outPath = path.join(root, def.outPath);
  await ensureDir(outPath);

  if (def.format === 'svg') {
    fs.writeFileSync(outPath, svg);
  } else {
    // rasterize via sharp
    let pipeline = sharp(Buffer.from(svg)).resize(def.width, def.height, { fit: 'cover' });
    if (def.format === 'png') {
      pipeline = pipeline.png({ quality: 90 });
    } else if (def.format === 'jpg' || def.format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality: 85, mozjpeg: true });
    }
    const buf = await pipeline.toBuffer();
    fs.writeFileSync(outPath, buf);
  }

  if (upload) {
    const bucket = process.env.ASSET_BUCKET || 'public-assets';
    const contentType = def.format === 'svg' ? 'image/svg+xml' : (def.format === 'png' ? 'image/png' : 'image/jpeg');
    const toPath = def.uploadPath || def.outPath.replace(/^public\//, '');
    await uploadFile({ bucket, fromPath: outPath, toPath, contentType });
    console.log(`[UPLOAD] -> storage://${bucket}/${toPath}`);
  }

  console.log(`[OK] Generated ${def.outPath}`);
}

async function main() {
  const idArg = process.argv.find(a => a.startsWith('--id='));
  if (!idArg) throw new Error('Pass --id=<assetId>');
  const id = idArg.split('=')[1];
  const upload = !!process.argv.find(a => a === '--upload') || process.env.ASSET_UPLOAD === '1';

  const config = loadConfig();
  const def = config.assets.find(a => a.id === id);
  if (!def) throw new Error(`Asset id not found: ${id}`);

  await renderAsset(def, { upload });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
