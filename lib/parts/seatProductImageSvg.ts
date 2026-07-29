export type SeatProductImageInput = {
  brand: string;
  oemPn: string;
  /** Seats | Seat cushions | Seat covers */
  category: string;
  /** assembly | cushion_back | cushion_bottom | cover | etc. */
  productType?: string;
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

function categoryEyebrow(category: string): string {
  switch (category) {
    case "Seat cushions":
      return "SEAT CUSHION";
    case "Seat covers":
      return "SEAT COVER";
    case "Seats":
      return "SEAT ASSEMBLY";
    default:
      return "SEAT";
  }
}

function typeLabel(category: string, productType?: string): string {
  const t = (productType || "").toLowerCase();
  if (t.includes("back")) return "Back Cushion";
  if (t.includes("bottom")) return "Bottom Cushion";
  if (t.includes("cover")) return "Replacement Cover";
  if (t.includes("assembly") || category === "Seats") return "Seat Assembly";
  if (category === "Seat covers") return "Replacement Cover";
  if (category === "Seat cushions") return "Replacement Cushion";
  return "Seat";
}

function seatIllustration(category: string, productType?: string): string {
  const t = (productType || "").toLowerCase();
  const vinyl = "#1e293b";
  const stitch = "#64748b";
  const accent = "#334155";

  if (category === "Seat covers" || t.includes("cover")) {
    return `
    <g transform="translate(300 160)">
      <path d="M120 40 C220 10, 380 10, 480 40 L500 420 C380 460, 220 460, 100 420 Z" fill="${vinyl}" stroke="${stitch}" stroke-width="8"/>
      <path d="M160 80 C250 55, 350 55, 440 80" fill="none" stroke="${stitch}" stroke-width="4" stroke-dasharray="10 8"/>
      <path d="M170 200 C260 175, 340 175, 430 200" fill="none" stroke="${stitch}" stroke-width="4" stroke-dasharray="10 8"/>
    </g>`;
  }

  if (category === "Seat cushions" || t.includes("cushion")) {
    if (t.includes("back")) {
      return `
      <g transform="translate(340 140)">
        <rect x="80" y="40" width="360" height="420" rx="36" fill="${vinyl}"/>
        <rect x="120" y="90" width="280" height="300" rx="24" fill="${accent}"/>
        <path d="M150 140 C260 110, 350 110, 450 140" fill="none" stroke="${stitch}" stroke-width="5" stroke-dasharray="12 8" transform="translate(-40 0)"/>
      </g>`;
    }
    // bottom cushion default
    return `
    <g transform="translate(280 220)">
      <ellipse cx="320" cy="220" rx="260" ry="160" fill="${vinyl}"/>
      <ellipse cx="320" cy="200" rx="210" ry="110" fill="${accent}"/>
      <path d="M140 200 C220 140, 420 140, 500 200" fill="none" stroke="${stitch}" stroke-width="5" stroke-dasharray="12 8"/>
    </g>`;
  }

  // Full seat assembly
  return `
  <g transform="translate(300 120)">
    <rect x="150" y="40" width="300" height="260" rx="28" fill="${vinyl}"/>
    <rect x="180" y="80" width="240" height="180" rx="18" fill="${accent}"/>
    <ellipse cx="300" cy="380" rx="230" ry="120" fill="${vinyl}"/>
    <ellipse cx="300" cy="360" rx="180" ry="80" fill="${accent}"/>
    <rect x="250" y="470" width="100" height="70" rx="10" fill="#0f172a"/>
    <path d="M190 120 C300 85, 410 85, 510 120" fill="none" stroke="${stitch}" stroke-width="4" stroke-dasharray="10 8" transform="translate(-100 0)"/>
  </g>`;
}

/** 1200×1200 Merchant-safe seat card — unique per brand/PN/type, no promo copy. */
export function buildSeatProductImageSvg(input: SeatProductImageInput): string {
  const label = typeLabel(input.category, input.productType);
  const materialNote = input.material
    ? input.material.replace(/_/g, " ")
    : "aftermarket";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${SIZE}" height="${SIZE}" fill="#ffffff"/>
  ${seatIllustration(input.category, input.productType)}
  <rect x="0" y="920" width="${SIZE}" height="280" fill="#f8fafc"/>
  <rect x="0" y="920" width="${SIZE}" height="2" fill="#e2e8f0"/>
  <text x="80" y="990" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="28" font-weight="600" fill="#64748b" letter-spacing="3">${escapeXml(categoryEyebrow(input.category))}</text>
  <text x="80" y="1060" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="56" font-weight="700" fill="#0f172a">${escapeXml(input.oemPn)}</text>
  <text x="80" y="1125" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="34" font-weight="600" fill="#334155">${escapeXml(label)} · ${escapeXml(input.brand)}</text>
  <text x="80" y="1175" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="26" fill="#64748b">${escapeXml(materialNote)}</text>
</svg>`;
}
