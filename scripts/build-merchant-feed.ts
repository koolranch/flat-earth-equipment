/**
 * Build Google Merchant Center product feed.
 *
 * Keep set (stable g:id — do not rewrite SKUs already in Center review):
 *   rubber tracks, cab glass, lithium batteries, Navitas kits, seats,
 *   reman charger modules, JCB Buy Now parts, plus an explicit slug
 *   allowlist for photo-ready Buy Now SKUs outside those categories.
 *   JCB brand-logo heroes stay in the feed — Merchant has already
 *   approved some of those IDs, and dropping them would take Active
 *   listings offline. True placeholder.jpg / reman-as-new / Repair &
 *   Return rows stay out.
 *
 * Generates two formats at the canonical paths Google reads from when
 * configured to fetch a remote feed:
 *   public/feed/google-merchant.json   — full debug feed (JSON)
 *   public/feed/google-merchant.xml    — RSS 2.0 with Google product extensions
 *
 * To submit:
 *   1. Run: npx tsx scripts/build-merchant-feed.ts
 *   2. Commit + deploy (the file will be served from /feed/google-merchant.xml)
 *   3. In Google Merchant Center → Products → Feeds → Add a fetch feed
 *      pointing at https://www.flatearthequipment.com/feed/google-merchant.xml
 */

import { writeFileSync, existsSync, mkdirSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import { getDisplayBrand, sanitizeCustomerFacingCopy } from "../lib/parts/displayBrand";
import {
  qualifiesForSeatFreeFreight,
} from "../lib/parts/seatFreight";
import { CHARGER_MODULES } from "../constants/chargerOptions";
import { buildLithiumRhinoMetaTitle } from "../constants/lithiumRhinoSeo";

dotenv.config({ path: path.resolve(process.cwd(), ".env.production.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const SITE_URL = "https://www.flatearthequipment.com";
const DEFAULT_PRODUCT_IMAGE = `${SITE_URL}/images/parts/placeholder.jpg`;
/** Clean studio hero for rubber tracks (no text/watermarks — Merchant-safe). */
const RUBBER_TRACK_HERO_IMAGE = `${SITE_URL}/images/parts/tracks/rubber-track-hero.jpg`;
/** Bump when track JPG bytes change so Merchant recrawls (same path is cached). */
const TRACK_IMAGE_CACHE_BUST = "20260815";
const CAB_GLASS_IMAGE_DIR = path.resolve(process.cwd(), "public/images/parts/glass");
const SEAT_IMAGE_DIR = path.resolve(process.cwd(), "public/images/parts/seats");
const RUBBER_TRACK_IMAGE_DIR = path.resolve(
  process.cwd(),
  "public/images/parts/tracks"
);

type PartRow = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  oem_reference: string | null;
  price_cents: number | null;
  image_url: string | null;
  brand: string | null;
  category: string | null;
  description: string | null;
  is_in_stock: boolean | null;
  weight_lbs: number | null;
  metadata: Record<string, unknown> | null;
};

type FeedShipping = {
  country: string;
  service: string;
  price: string;
};

type FeedItem = {
  id: string;
  title: string;
  description: string;
  link: string;
  image_link: string;
  price: string;
  brand: string;
  mpn: string;
  condition: "new" | "refurbished" | "used";
  availability: "in stock" | "out of stock";
  google_product_category?: string;
  product_type?: string;
  shipping_weight?: string;
  identifier_exists: "no";
  /** Ads / Merchant filters — high-value lines get priority labels. */
  custom_label_0?: string;
  shipping?: FeedShipping[];
};

/** Normalize storage URLs that accidentally include a double slash. */
function normalizeImageUrl(url: string): string {
  return url.replace(
    /^(https?:\/\/[^/]+\/storage\/v1\/object\/public\/[^/]+)\/*\//,
    "$1/"
  );
}

function isRubberTrack(p: Pick<PartRow, "category" | "slug">): boolean {
  return p.category === "Rubber Tracks" || p.slug.includes("rubber-track");
}

function isCabGlass(p: Pick<PartRow, "category">): boolean {
  return p.category === "Cab Glass";
}

function isSeatCategory(p: Pick<PartRow, "category">): boolean {
  return (
    p.category === "Seats" ||
    p.category === "Seat cushions" ||
    p.category === "Seat covers"
  );
}

function isLithiumBattery(p: Pick<PartRow, "category">): boolean {
  return p.category === "Lithium Batteries";
}

function isNavitasKit(p: Pick<PartRow, "brand" | "slug">): boolean {
  const brand = (p.brand || "").toLowerCase();
  const slug = (p.slug || "").toLowerCase();
  return brand === "navitas" || slug.startsWith("navitas-");
}

function isJcbPart(p: Pick<PartRow, "brand" | "category">): boolean {
  const brand = (p.brand || "").toLowerCase();
  const category = (p.category || "").toLowerCase();
  return brand === "jcb" || category.startsWith("jcb");
}

/**
 * Photo-ready Buy Now SKUs outside category keep-set (stable g:id = parts.sku).
 * Add new Shopping candidates here — do not expand whole brands/categories.
 */
const MERCHANT_KEEP_SLUGS = new Set([
  "mitsubishi-32k62-00300-fuel-water-separator",
  "tcm-wm682-vinyl-seat",
  "toyota-53740-unl8g-71-seat-belt",
  "hyster-4221086-high-vis-seat-belt",
  "hyster-1490071-36v-fan",
  "tennant-9008999-wheel-gearbox-kit",
  "genie-33984gt-standard-forks",
  "sevcon-622-11201-36-48v-dc-dc-converter",
  "skytrack-70021617-steering-cylinder",
  "bobcat-7123864-excavator-swivel",
  "delta-q-quiq-48v-18a-charger-9124800",
  "taylor-dunn-79-303-41-battery-charger",
  "taylor-dunn-62-033-48-accelerator-module",
  "powerboss-620265-filter",
]);

/** Catalog lines we will submit while Merchant is still approving the first wave. */
function isKeepSetPart(p: PartRow): boolean {
  if (isRubberTrack(p)) return true;
  if (isCabGlass(p)) return true;
  if (isLithiumBattery(p)) return true;
  if (isSeatCategory(p)) return true;
  if (isNavitasKit(p)) return true;
  if (isJcbPart(p)) return true;
  if (MERCHANT_KEEP_SLUGS.has(p.slug)) return true;
  return false;
}

function isRemanOrRepairService(p: Pick<PartRow, "name" | "description">): boolean {
  const text = `${p.name} ${p.description || ""}`;
  if (/\brepair\s*(and|&)\s*return\b/i.test(text)) return true;
  return /\b(reman(?:ufactured)?|refurbished)\b/i.test(text);
}

function isPlaceholderImage(url: string): boolean {
  return /placeholder\.jpg/i.test(url);
}

function isBrandLogoImage(url: string): boolean {
  return /brand-logos/i.test(url);
}

/** Placeholder never ships. JCB may keep the brand-logo hero (already approved). */
function isAllowedFeedImage(
  url: string,
  p: Pick<PartRow, "brand" | "category">
): boolean {
  if (isPlaceholderImage(url)) return false;
  if (isBrandLogoImage(url) && !isJcbPart(p)) return false;
  return true;
}

function isUsableProductImage(url: string | null | undefined): boolean {
  if (!url) return false;
  if (/placeholder\.jpg/i.test(url)) return false;
  if (/brand-logos/i.test(url)) return false;
  if (/\.webp$/i.test(url) && /brand-logos/i.test(url)) return false;
  return true;
}

/**
 * Per-slug JPG path stays stable; `?v=` changes when the file bytes change so
 * Merchant recrawls instead of keeping the old text-card cache. Do not
 * regenerate the old TVH-style cards onto these paths.
 */
function rubberTrackImageLink(slug: string): string {
  const localPath = path.join(RUBBER_TRACK_IMAGE_DIR, `${slug}.jpg`);
  const base = existsSync(localPath)
    ? `${SITE_URL}/images/parts/tracks/${slug}.jpg`
    : RUBBER_TRACK_HERO_IMAGE;
  return `${base}?v=${TRACK_IMAGE_CACHE_BUST}`;
}

/** Bump when a glass JPG is replaced so Merchant recrawls the same path. */
const GLASS_IMAGE_CACHE_BUST: Record<string, string> = {
  "bobcat-7120401-door-glass": "20260818",
  "caterpillar-345-6230-door-glass": "20260818",
  "john-deere-t312628-door-glass": "20260818",
  "bobcat-6729776-door-glass": "20260818",
};

/** Unique per-SKU cab glass cards — never fall back to the shared placeholder. */
function cabGlassImageLink(slug: string, imageUrl: string | null): string {
  const localPath = path.join(CAB_GLASS_IMAGE_DIR, `${slug}.jpg`);
  if (existsSync(localPath)) {
    const bust = GLASS_IMAGE_CACHE_BUST[slug];
    const base = `${SITE_URL}/images/parts/glass/${slug}.jpg`;
    return bust ? `${base}?v=${bust}` : base;
  }
  if (isUsableProductImage(imageUrl)) {
    return normalizeImageUrl(imageUrl!);
  }
  return DEFAULT_PRODUCT_IMAGE;
}

/**
 * Prefer real seat photography when present; otherwise unique Merchant cards.
 * Never use brand logos (Shopping + site policy for seats).
 */
function seatImageLink(slug: string, imageUrl: string | null): string {
  if (isUsableProductImage(imageUrl)) {
    return normalizeImageUrl(imageUrl!);
  }
  const localPath = path.join(SEAT_IMAGE_DIR, `${slug}.jpg`);
  if (existsSync(localPath)) {
    return `${SITE_URL}/images/parts/seats/${slug}.jpg`;
  }
  return DEFAULT_PRODUCT_IMAGE;
}

function productImageLink(p: PartRow): string {
  if (isRubberTrack(p)) return rubberTrackImageLink(p.slug);
  if (isCabGlass(p)) return cabGlassImageLink(p.slug, p.image_url);
  if (isSeatCategory(p)) return seatImageLink(p.slug, p.image_url);
  if (isUsableProductImage(p.image_url)) return normalizeImageUrl(p.image_url!);
  if (p.image_url) return normalizeImageUrl(p.image_url);
  return DEFAULT_PRODUCT_IMAGE;
}

function customLabel0ForCategory(
  category: string | null | undefined
): string | undefined {
  switch (category) {
    case "Rubber Tracks":
      return "priority_rubber_tracks";
    case "Lithium Batteries":
      return "priority_lithium";
    case "Charger Modules":
      return "priority_charger_modules";
    case "Cab Glass":
      return "priority_cab_glass";
    case "Seats":
    case "Seat cushions":
    case "Seat covers":
      return "priority_seats";
    default:
      return undefined;
  }
}

function customLabel0ForPart(
  p: Pick<PartRow, "category" | "brand" | "slug">
): string | undefined {
  if (isNavitasKit(p)) return "priority_navitas";
  const fromCategory = customLabel0ForCategory(p.category);
  if (fromCategory) return fromCategory;
  if (isJcbPart(p)) return "priority_jcb";
  return undefined;
}

/**
 * Map our internal category to Google Product Category taxonomy IDs.
 * https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt
 */
function googleProductCategory(category: string | null): string | undefined {
  if (!category) return undefined;
  switch (category) {
    case "Lithium Batteries":
      return "Vehicles & Parts > Vehicle Parts & Accessories > Vehicle Maintenance, Care & Decor > Vehicle Repair & Specialty Tools";
    case "Charger Modules":
      return "Vehicles & Parts > Vehicle Parts & Accessories > Vehicle Repair & Specialty Tools";
    case "Cab Glass":
      return "Business & Industrial > Construction > Construction Machinery Accessories";
    case "Class II Forks":
    case "Class III Forks":
    case "Class IV Forks":
    case "Lumber Forks":
    case "Forks":
      return "Business & Industrial > Material Handling";
    case "Rubber Tracks":
      return "Business & Industrial > Construction > Construction Machinery Accessories";
    case "Mirrors":
    case "Brakes":
    case "Seats":
    case "Seat cushions":
    case "Seat covers":
    case "Undercarriage":
    case "Steering rod ends":
    case "Hydraulic Cylinders":
      return "Business & Industrial > Material Handling > Forklifts";
    default:
      return "Business & Industrial > Material Handling";
  }
}

/**
 * Map weight_lbs to Google's expected `shipping_weight` format.
 */
function shippingWeight(weight_lbs: number | null): string | undefined {
  if (!weight_lbs || weight_lbs <= 0) return undefined;
  return `${weight_lbs} lb`;
}

/** HazMat ground freight for a single lithium battery (checkout qty under 3). */
function lithiumFreightUsd(weightLbs: number): string {
  let cents = 34900;
  if (weightLbs < 50) cents = 9900;
  else if (weightLbs < 100) cents = 14900;
  else if (weightLbs < 150) cents = 19900;
  else if (weightLbs < 200) cents = 27900;
  return `${(cents / 100).toFixed(2)} USD`;
}

/** Surface freight for a single cab-glass item (TVH-style bands on sell price). */
function cabGlassFreightUsd(priceCents: number): string {
  const dollars = priceCents / 100;
  let cents = 0;
  if (dollars <= 0) cents = 0;
  else if (dollars < 25) cents = 1800;
  else if (dollars < 150) cents = 2500;
  else if (dollars < 300) cents = 3100;
  else if (dollars < 500) cents = 3700;
  else if (dollars < 650) cents = 4100;
  // $650+ surface freight prepaid
  return `${(cents / 100).toFixed(2)} USD`;
}

function hasFreeFreight(p: PartRow): boolean {
  const meta = p.metadata ?? {};
  if (meta.free_freight === true || meta.free_freight === "true") return true;
  if (isRubberTrack(p)) return true;
  return qualifiesForSeatFreeFreight(p.category, meta);
}

function seatFreightUsd(p: PartRow): string | undefined {
  if (p.category === "Seats") {
    if (qualifiesForSeatFreeFreight(p.category, p.metadata)) return "0.00 USD";
    return "25.00 USD";
  }
  if (p.category === "Seat cushions" || p.category === "Seat covers") {
    // Match checkout flat $29 (vendor prepaid over ~$650 net is rare on cushions).
    return "29.00 USD";
  }
  return undefined;
}

function partShipping(p: PartRow): FeedShipping[] | undefined {
  if (hasFreeFreight(p)) {
    return [{ country: "US", service: "Ground", price: "0.00 USD" }];
  }
  // Per-SKU checkout override (e.g. Genie SLC forks $37) — must match Ads landed price.
  const freightCents = Number(p.metadata?.freight_cents);
  if (Number.isFinite(freightCents) && freightCents > 0) {
    return [
      {
        country: "US",
        service: "Ground",
        price: `${(freightCents / 100).toFixed(2)} USD`,
      },
    ];
  }
  if (p.category === "Lithium Batteries") {
    const weight = Number(p.metadata?.weight_lbs ?? p.weight_lbs ?? 100);
    return [
      {
        country: "US",
        service: "HazMat Ground",
        price: lithiumFreightUsd(weight),
      },
    ];
  }
  if (isCabGlass(p) && p.price_cents) {
    return [
      {
        country: "US",
        service: "Ground",
        price: cabGlassFreightUsd(p.price_cents),
      },
    ];
  }
  if (isSeatCategory(p)) {
    const price = seatFreightUsd(p);
    if (price) {
      return [{ country: "US", service: "Ground", price }];
    }
  }
  return undefined;
}

/** Legacy /parts/* charger URLs 301 to the hub — never feed those landing pages. */
function isLegacyChargerModulePart(p: PartRow): boolean {
  if (p.category === "Charger Modules") return true;
  const slug = p.slug.toLowerCase();
  if (slug.includes("forklift-charger-module")) return true;
  if (slug.startsWith("act-quantum-") && (slug.endsWith("-reman") || slug.endsWith("-repair"))) {
    return true;
  }
  if (slug.includes("charger-module") && (slug.includes("repair") || slug.includes("reman"))) {
    return true;
  }
  return false;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Merchant descriptions for rubber tracks: one clear aftermarket disclosure
 * (OEM brand + aftermarket parts is a common misrepresentation flag) plus the
 * existing free-shipping / 2-year warranty copy from the PDP description.
 * OEM cross-reference numbers stay in body copy when present — not as MPN.
 */
function rubberTrackFeedDescription(p: PartRow): string {
  const body = sanitizeCustomerFacingCopy(p.description || "").trim();
  const disclosure =
    "Aftermarket replacement rubber track (not OEM). Free shipping and a 2-year warranty included.";
  if (!body) return disclosure;
  if (/aftermarket/i.test(body)) return body.slice(0, 5000);
  return `${disclosure}\n\n${body}`.slice(0, 5000);
}

/**
 * Unique per-SKU MPN for Shopping. Prefer house RT-* sku over shared OEM
 * cross-refs so sibling model listings (e.g. Case TV370/TV450 block) do not
 * collide in Merchant.
 */
function rubberTrackFeedMpn(p: PartRow): string {
  return p.sku || p.id;
}

function partToFeedItem(p: PartRow): FeedItem | null {
  if (!p.price_cents || p.price_cents <= 0) return null;

  const lithiumTitle = buildLithiumRhinoMetaTitle({
    category: p.category,
    sku: p.sku,
    metadata: p.metadata,
  });

  const track = isRubberTrack(p);
  const shipping = partShipping(p);
  const label = customLabel0ForPart(p);
  const item: FeedItem = {
    id: p.sku || p.id,
    title: lithiumTitle || p.name,
    description: track
      ? rubberTrackFeedDescription(p)
      : sanitizeCustomerFacingCopy(p.description || "").slice(0, 5000),
    link: `${SITE_URL}/parts/${p.slug}`,
    image_link: productImageLink(p),
    price: `${(p.price_cents / 100).toFixed(2)} USD`,
    brand: getDisplayBrand(p.brand),
    mpn: track ? rubberTrackFeedMpn(p) : p.oem_reference || p.sku || p.id,
    condition: "new",
    availability: p.is_in_stock === false ? "out of stock" : "in stock",
    google_product_category: googleProductCategory(p.category),
    product_type: p.category || undefined,
    shipping_weight: shippingWeight(p.weight_lbs),
    identifier_exists: "no",
  };
  if (label) item.custom_label_0 = label;
  if (shipping) item.shipping = shipping;
  return item;
}

/**
 * Reman Exchange only — physical refurbished modules with Buy Now on
 * /charger-modules/{slug}. Repair & Return is a service and is excluded.
 */
function chargerModuleFeedItems(): FeedItem[] {
  const items: FeedItem[] = [];

  for (const mod of CHARGER_MODULES) {
    const reman = mod.offers.find((o) => o.label === "Reman Exchange");
    if (!reman || reman.price <= 0) continue;

    const cross = mod.crossRefPn
      ? ` Cross-references ${mod.crossRefPn}.`
      : "";
    const core = reman.coreCharge
      ? ` A $${reman.coreCharge} refundable core deposit applies at checkout.`
      : "";

    items.push({
      id: `charger-${mod.slug}-reman`,
      title: `${mod.title} (Reman Exchange)`,
      description: sanitizeCustomerFacingCopy(
        [
          `Remanufactured ${mod.brand} forklift charger module ${mod.partNumber}.`,
          reman.desc,
          cross.trim(),
          core.trim(),
          "In stock for exchange; ships when ordered before 3 PM EST on business days.",
        ]
          .filter(Boolean)
          .join(" ")
      ).slice(0, 5000),
      link: `${SITE_URL}/charger-modules/${mod.slug}`,
      image_link: normalizeImageUrl(mod.imgExchange),
      price: `${(reman.price / 100).toFixed(2)} USD`,
      brand: mod.brand,
      mpn: mod.partNumber,
      condition: "refurbished",
      availability: "in stock",
      google_product_category: googleProductCategory("Charger Modules"),
      product_type: "Charger Modules",
      identifier_exists: "no",
      custom_label_0: customLabel0ForCategory("Charger Modules"),
      // Checkout currently does not add a charger-module freight line.
      shipping: [{ country: "US", service: "Ground", price: "0.00 USD" }],
    });
  }

  return items;
}

function shippingXml(shipping: FeedShipping[] | undefined): string {
  if (!shipping?.length) return "";
  return shipping
    .map(
      (s) => `      <g:shipping>
        <g:country>${escapeXml(s.country)}</g:country>
        <g:service>${escapeXml(s.service)}</g:service>
        <g:price>${escapeXml(s.price)}</g:price>
      </g:shipping>
`
    )
    .join("");
}

function itemToXml(item: FeedItem): string {
  const gpc = item.google_product_category;
  const sw = item.shipping_weight;

  return `    <item>
      <g:id>${escapeXml(item.id)}</g:id>
      <title>${escapeXml(item.title)}</title>
      <description>${escapeXml(item.description)}</description>
      <link>${escapeXml(item.link)}</link>
      <g:image_link>${escapeXml(item.image_link)}</g:image_link>
      <g:price>${escapeXml(item.price)}</g:price>
      <g:brand>${escapeXml(item.brand)}</g:brand>
      <g:mpn>${escapeXml(item.mpn)}</g:mpn>
      <g:condition>${escapeXml(item.condition)}</g:condition>
      <g:availability>${escapeXml(item.availability)}</g:availability>
      <g:identifier_exists>${escapeXml(item.identifier_exists)}</g:identifier_exists>
${gpc ? `      <g:google_product_category>${escapeXml(gpc)}</g:google_product_category>\n` : ""}${
    item.product_type
      ? `      <g:product_type>${escapeXml(item.product_type)}</g:product_type>\n`
      : ""
  }${
    item.custom_label_0
      ? `      <g:custom_label_0>${escapeXml(item.custom_label_0)}</g:custom_label_0>\n`
      : ""
  }${sw ? `      <g:shipping_weight>${escapeXml(sw)}</g:shipping_weight>\n` : ""}${shippingXml(
    item.shipping
  )}    </item>`;
}

async function buildFeed() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Pull priced direct-sale products. Quote-only stubs are excluded.
  const { data: parts, error } = await supabase
    .from("parts")
    .select(
      "id, name, slug, sku, oem_reference, price_cents, image_url, brand, category, description, is_in_stock, weight_lbs, metadata"
    )
    .gt("price_cents", 0)
    .eq("sales_type", "direct");

  if (error) throw new Error(`Supabase fetch failed: ${error.message}`);
  if (!parts) throw new Error("No parts returned from Supabase");

  const catalog = parts as PartRow[];
  const skippedChargers = catalog.filter((p) => isLegacyChargerModulePart(p)).length;
  const rows = catalog.filter(
    (p) =>
      !isLegacyChargerModulePart(p) &&
      isKeepSetPart(p) &&
      !isRemanOrRepairService(p)
  );
  const skippedOutsideKeepSet = catalog.length - skippedChargers - rows.length;

  const feedItems: FeedItem[] = [];
  let skippedUnsafeImage = 0;
  for (const p of rows) {
    const item = partToFeedItem(p);
    if (!item) continue;
    if (!isAllowedFeedImage(item.image_link, p)) {
      skippedUnsafeImage += 1;
      continue;
    }
    feedItems.push(item);
  }

  const chargerItems = chargerModuleFeedItems();
  feedItems.push(...chargerItems);

  const dir = "public/feed";
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  writeFileSync(
    "public/feed/google-merchant.json",
    JSON.stringify(feedItems, null, 2)
  );

  const itemsXml = feedItems.map(itemToXml).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Flat Earth Equipment Product Feed</title>
    <link>${SITE_URL}</link>
    <description>Aftermarket rubber tracks, cab glass, lithium batteries, Navitas kits, seats, reman charger modules, selected JCB parts, and photo-ready Buy Now SKUs.</description>
${itemsXml}
  </channel>
</rss>
`;

  writeFileSync("public/feed/google-merchant.xml", xml);

  // -- Summary ----------------------------------------------------------------
  const byCategory: Record<string, number> = {};
  let freeShipCount = 0;
  let paidShipCount = 0;
  for (const item of feedItems) {
    const c = item.product_type || "(uncategorized)";
    byCategory[c] = (byCategory[c] || 0) + 1;
    if (item.shipping?.some((s) => s.price === "0.00 USD")) freeShipCount += 1;
    else if (item.shipping?.length) paidShipCount += 1;
  }
  console.log(`✅ Merchant feed built (${feedItems.length} products)`);
  console.log("   public/feed/google-merchant.json");
  console.log("   public/feed/google-merchant.xml");
  console.log(
    `   Skipped legacy /parts charger rows (redirect to hub): ${skippedChargers}`
  );
  console.log(`   Skipped outside keep set: ${skippedOutsideKeepSet}`);
  console.log(`   Skipped placeholder / non-JCB logo images: ${skippedUnsafeImage}`);
  console.log(`   Charger Reman Exchange offers: ${chargerItems.length}`);
  console.log(`   Free-shipping items: ${freeShipCount}`);
  console.log(`   Paid-shipping items (incl. lithium HazMat): ${paidShipCount}`);
  console.log("\n   Category breakdown:");
  for (const [c, n] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`     ${n.toString().padStart(4)} × ${c}`);
  }
}

buildFeed().catch((e) => {
  console.error("❌ Feed build failed:", e);
  process.exit(1);
});
