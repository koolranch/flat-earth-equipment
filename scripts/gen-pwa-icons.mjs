import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'public', 'icons', 'app-icon.svg');
const OUT_DIR = path.join(ROOT, 'public', 'icons');
const targets = [
  { size: 192, out: 'app-icon-192.png' },
  { size: 512, out: 'app-icon-512.png' }
];

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error('❌ Missing', SRC);
    process.exit(1);
  }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const svg = fs.readFileSync(SRC);
  for (const t of targets) {
    const buf = await sharp(svg).resize(t.size, t.size, { fit: 'cover' }).png({ compressionLevel: 9 }).toBuffer();
    const out = path.join(OUT_DIR, t.out);
    fs.writeFileSync(out, buf);
    console.log('✅ wrote', out);
  }
  console.log('Done.');
}

main().catch((e) => { console.error(e); process.exit(1); });
