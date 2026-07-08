import { parseTrackSize } from '@/lib/parts/rubberTrackUtils';

export type TrackProductImageInput = {
  /** Short label, e.g. "Bobcat T650" */
  modelLabel: string;
  size: string;
  treadPattern: string;
};

const SIZE = 1200;

function normalizeTread(treadPattern: string): string {
  const t = treadPattern.toLowerCase().replace(/\bpattern\b/g, '').trim();
  if (t.includes('zig')) return 'zigzag';
  if (t.includes('block') || t.includes('bridgestone')) return 'block';
  if (t.includes('straight') || t.includes('multibar')) return 'bar';
  return 'c';
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function lugRow(
  tread: string,
  row: number,
  cols: number,
  originX: number,
  originY: number,
  lugW: number,
  lugH: number,
  gap: number
): string {
  const parts: string[] = [];
  for (let col = 0; col < cols; col++) {
    const x = originX + col * (lugW + gap);
    const y = originY + row * (lugH + gap);
    const offset = tread === 'c' && row % 2 === 1 ? lugW * 0.45 : 0;

    if (tread === 'zigzag') {
      parts.push(
        `<polygon points="${x + offset},${y + lugH} ${x + offset + lugW * 0.5},${y} ${x + offset + lugW},${y + lugH}" fill="#1a1a1a"/>`
      );
      continue;
    }

    if (tread === 'bar') {
      parts.push(
        `<rect x="${x + offset}" y="${y + lugH * 0.15}" width="${lugW}" height="${lugH * 0.35}" rx="3" fill="#1a1a1a"/>`
      );
      continue;
    }

    // block + c pattern (rounded blocks; c pattern staggers rows)
    const rx = tread === 'block' ? 2 : 6;
    parts.push(
      `<rect x="${x + offset}" y="${y}" width="${lugW}" height="${lugH}" rx="${rx}" fill="#1a1a1a"/>`
    );
    if (tread === 'c') {
      parts.push(
        `<rect x="${x + offset + lugW * 0.12}" y="${y + lugH * 0.18}" width="${lugW * 0.76}" height="${lugH * 0.12}" rx="2" fill="#333"/>`
      );
    }
  }
  return parts.join('\n');
}

function trackIllustration(treadPattern: string): string {
  const tread = normalizeTread(treadPattern);
  const cols = tread === 'bar' ? 7 : 6;
  const rows = 5;
  const lugW = tread === 'bar' ? 88 : 72;
  const lugH = tread === 'bar' ? 36 : 48;
  const gap = 10;

  const lugs: string[] = [];
  for (let row = 0; row < rows; row++) {
    lugs.push(lugRow(tread, row, cols, 0, 0, lugW, lugH, gap));
  }

  const beltW = cols * (lugW + gap);
  const beltH = rows * (lugH + gap) + 40;

  return `
  <g transform="translate(220 210) rotate(-18 ${beltW / 2} ${beltH / 2})">
    <rect x="-18" y="-12" width="${beltW + 36}" height="${beltH + 24}" rx="28" fill="#0f0f0f"/>
    <rect x="0" y="0" width="${beltW}" height="${beltH}" rx="18" fill="#262626"/>
    <rect x="${beltW * 0.28}" y="8" width="${beltW * 0.44}" height="${beltH - 16}" rx="8" fill="#111"/>
    ${lugs.join('\n')}
    <rect x="${beltW * 0.34}" y="${beltH * 0.22}" width="${beltW * 0.32}" height="${beltH * 0.56}" rx="6" fill="#090909" opacity="0.55"/>
  </g>`;
}

/** 1200×1200 product image SVG — white background, TVH-style track hero + spec bar. */
export function buildTrackProductImageSvg(input: TrackProductImageInput): string {
  const specs = parseTrackSize(input.size);
  const sizeLabel = input.size.replace(/x/gi, '×');
  const treadLabel = input.treadPattern.replace(/\bpattern\b/i, '').trim();
  const widthNote = specs ? `${specs.widthMm} mm (${specs.widthIn}")` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${SIZE}" height="${SIZE}" fill="#ffffff"/>
  ${trackIllustration(input.treadPattern)}
  <rect x="0" y="920" width="${SIZE}" height="280" fill="#f8fafc"/>
  <rect x="0" y="920" width="${SIZE}" height="2" fill="#e2e8f0"/>
  <text x="80" y="990" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="28" font-weight="600" fill="#64748b" letter-spacing="3">RUBBER TRACK</text>
  <text x="80" y="1060" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="72" font-weight="700" fill="#0f172a">${escapeXml(sizeLabel)}</text>
  <text x="80" y="1125" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="34" font-weight="600" fill="#334155">${escapeXml(treadLabel)} tread · ${escapeXml(input.modelLabel)}</text>
  ${
    widthNote
      ? `<text x="80" y="1175" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="26" fill="#64748b">${escapeXml(widthNote)} · Free shipping · 2-year warranty</text>`
      : `<text x="80" y="1175" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="26" fill="#64748b">Free shipping · 2-year warranty</text>`
  }
</svg>`;
}
