/**
 * Rasterize public/favicon.svg into ICO/PNG pack for Google SERP + browsers.
 * Run: node scripts/generate-favicons.mjs
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const svgPath = path.join(root, 'public/favicon.svg');
const iconsDir = path.join(root, 'public/icons');
const svg = fs.readFileSync(svgPath);

fs.mkdirSync(iconsDir, { recursive: true });

async function png(size, outPath) {
  const buf = await sharp(svg, { density: Math.max(72, size * 3) })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  fs.writeFileSync(outPath, buf);
  return buf;
}

/** Minimal ICO writer for square PNGs (Vista+ PNG-in-ICO). */
function buildIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const entries = [];
  for (const png of pngBuffers) {
    // Read IHDR for width/height
    const w = png[16] << 24 | png[17] << 16 | png[18] << 8 | png[19];
    const h = png[20] << 24 | png[21] << 16 | png[22] << 8 | png[23];
    entries.push({
      width: w >= 256 ? 0 : w,
      height: h >= 256 ? 0 : h,
      size: png.length,
      offset,
      png,
    });
    offset += png.length;
  }

  const out = Buffer.alloc(offset);
  out.writeUInt16LE(0, 0); // reserved
  out.writeUInt16LE(1, 2); // ICO
  out.writeUInt16LE(count, 4);
  let entryAt = 6;
  for (const e of entries) {
    out.writeUInt8(e.width, entryAt);
    out.writeUInt8(e.height, entryAt + 1);
    out.writeUInt8(0, entryAt + 2); // colors
    out.writeUInt8(0, entryAt + 3); // reserved
    out.writeUInt16LE(1, entryAt + 4); // planes
    out.writeUInt16LE(32, entryAt + 6); // bitcount
    out.writeUInt32LE(e.size, entryAt + 8);
    out.writeUInt32LE(e.offset, entryAt + 12);
    entryAt += 16;
  }
  for (const e of entries) {
    e.png.copy(out, e.offset);
  }
  return out;
}

const sizes = [
  [16, path.join(iconsDir, 'favicon-16.png')],
  [32, path.join(iconsDir, 'favicon-32.png')],
  [48, path.join(iconsDir, 'favicon-48.png')],
  [180, path.join(iconsDir, 'apple-touch-icon.png')],
  [192, path.join(iconsDir, 'app-icon-192.png')],
  [512, path.join(iconsDir, 'app-icon-512.png')],
];

const icoPngs = [];
for (const [size, out] of sizes) {
  const buf = await png(size, out);
  console.log('wrote', path.relative(root, out), buf.length);
  if (size === 16 || size === 32 || size === 48) icoPngs.push(buf);
}

const ico = buildIco(icoPngs);
fs.writeFileSync(path.join(root, 'public/favicon.ico'), ico);
console.log('wrote public/favicon.ico', ico.length);
