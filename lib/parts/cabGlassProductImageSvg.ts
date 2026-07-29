export type CabGlassProductImageInput = {
  brand: string;
  oemPn: string;
  /** e.g. door_glass, front_upper_window */
  glassType: string;
  /** clear | green | tinted */
  color?: string;
  material?: string;
};

const SIZE = 1200;

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function humanGlassType(glassType: string): string {
  const cleaned = glassType.replace(/_/g, " ").trim();
  if (!cleaned) return "Cab Glass";
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

function glassFill(color?: string, material?: string): {
  fill: string;
  stroke: string;
  gloss: string;
} {
  const mat = (material || "").toLowerCase();
  const col = (color || "").toLowerCase();
  if (mat.includes("polycarbonate")) {
    return { fill: "#dbeafe", stroke: "#64748b", gloss: "#ffffff" };
  }
  if (col.includes("green")) {
    return { fill: "#bbf7d0", stroke: "#64748b", gloss: "#ecfdf5" };
  }
  if (col.includes("tint") || col.includes("gray") || col.includes("grey")) {
    return { fill: "#cbd5e1", stroke: "#64748b", gloss: "#f8fafc" };
  }
  // clear tempered default
  return { fill: "#e0f2fe", stroke: "#64748b", gloss: "#ffffff" };
}

/** Simple panel silhouette — shape varies by glass type for uniqueness. */
function panelIllustration(glassType: string, color?: string, material?: string): string {
  const { fill, stroke, gloss } = glassFill(color, material);
  const t = glassType.toLowerCase();

  // Coordinates are inside a 640×520 artboard centered in the upper canvas.
  let panel =
    `<path d="M140 40 L500 40 L520 480 L120 480 Z" fill="${fill}" stroke="${stroke}" stroke-width="10"/>`;

  if (t.includes("door")) {
    panel = `<path d="M180 20 L460 20 L500 500 L140 500 Z" fill="${fill}" stroke="${stroke}" stroke-width="10"/>`;
  } else if (t.includes("roof")) {
    panel = `<path d="M80 160 L560 160 L540 360 L100 360 Z" fill="${fill}" stroke="${stroke}" stroke-width="10"/>`;
  } else if (t.includes("rear")) {
    panel = `<path d="M100 120 L540 120 L520 400 L120 400 Z" fill="${fill}" stroke="${stroke}" stroke-width="10"/>`;
  } else if (t.includes("sliding") || t.includes("slider")) {
    panel = `<rect x="120" y="80" width="400" height="360" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="10"/>
      <line x1="320" y1="90" x2="320" y2="430" stroke="${stroke}" stroke-width="8" stroke-dasharray="14 10"/>`;
  } else if (t.includes("windshield") || t.includes("front")) {
    panel = `<path d="M160 60 L480 60 L540 440 L100 440 Z" fill="${fill}" stroke="${stroke}" stroke-width="10"/>`;
  } else if (t.includes("side")) {
    panel = `<path d="M200 40 L440 40 L480 480 L160 480 Z" fill="${fill}" stroke="${stroke}" stroke-width="10"/>`;
  } else if (
    t.includes("seal") ||
    t.includes("cord") ||
    t.includes("adhesive") ||
    t.includes("cleaner") ||
    t.includes("handle") ||
    t.includes("decal") ||
    t.includes("spring")
  ) {
    // Accessory — smaller badge, not a full panel
    panel = `<rect x="180" y="120" width="280" height="280" rx="28" fill="${fill}" stroke="${stroke}" stroke-width="10"/>
      <circle cx="320" cy="260" r="54" fill="none" stroke="${stroke}" stroke-width="10"/>`;
  }

  return `
  <g transform="translate(280 120)">
    ${panel}
    <ellipse cx="250" cy="140" rx="90" ry="36" fill="${gloss}" opacity="0.45"/>
  </g>`;
}

/** 1200×1200 Merchant-safe cab glass card — unique per brand/PN/type, no promo copy. */
export function buildCabGlassProductImageSvg(input: CabGlassProductImageInput): string {
  const typeLabel = humanGlassType(input.glassType);
  const materialNote = input.material
    ? input.material.replace(/_/g, " ")
    : "aftermarket";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${SIZE}" height="${SIZE}" fill="#ffffff"/>
  ${panelIllustration(input.glassType, input.color, input.material)}
  <rect x="0" y="920" width="${SIZE}" height="280" fill="#f8fafc"/>
  <rect x="0" y="920" width="${SIZE}" height="2" fill="#e2e8f0"/>
  <text x="80" y="990" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="28" font-weight="600" fill="#64748b" letter-spacing="3">CAB GLASS</text>
  <text x="80" y="1060" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="64" font-weight="700" fill="#0f172a">${escapeXml(input.oemPn)}</text>
  <text x="80" y="1125" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="34" font-weight="600" fill="#334155">${escapeXml(typeLabel)} · ${escapeXml(input.brand)}</text>
  <text x="80" y="1175" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="26" fill="#64748b">${escapeXml(materialNote)}</text>
</svg>`;
}
