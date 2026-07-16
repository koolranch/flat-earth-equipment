/**
 * Build Google Merchant Center product feed.
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

dotenv.config({ path: path.resolve(process.cwd(), ".env.production.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const SITE_URL = "https://www.flatearthequipment.com";
const DEFAULT_PRODUCT_IMAGE = `${SITE_URL}/images/parts/placeholder.jpg`;
/** Clean studio hero for rubber tracks (no text/watermarks — Merchant-safe). */
const RUBBER_TRACK_HERO_IMAGE = `${SITE_URL}/images/parts/tracks/rubber-track-hero.jpg`;

function productImageLink(p: PartRow): string {
  // Prefer the shared Merchant-safe studio hero for rubber tracks.
  // Per-SKU graphic cards with size/warranty text overlays are kept on PDPs
  // via image_url for now, but Shopping rejects promotional overlays.
  if (p.category === "Rubber Tracks" || p.slug.includes("rubber-track")) {
    return RUBBER_TRACK_HERO_IMAGE;
  }
  if (p.image_url) return p.image_url;
  return DEFAULT_PRODUCT_IMAGE;
}

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
    case "Class II Forks":
    case "Class III Forks":
    case "Class IV Forks":
    case "Lumber Forks":
    case "Forks":
      return "Business & Industrial > Material Handling";
    case "Rubber Tracks":
      return "Business & Industrial > Material Handling";
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

function hasFreeFreight(p: PartRow): boolean {
  const meta = p.metadata ?? {};
  if (meta.free_freight === true || meta.free_freight === "true") return true;
  if (p.category === "Rubber Tracks" || p.slug.includes("rubber-track")) return true;
  return qualifiesForSeatFreeFreight(p.category, meta);
}

function shippingXml(p: PartRow): string {
  if (!hasFreeFreight(p)) return "";
  // Contiguous US free ground — matches checkout for free_freight / rubber tracks.
  return `      <g:shipping>
        <g:country>US</g:country>
        <g:service>Ground</g:service>
        <g:price>0.00 USD</g:price>
      </g:shipping>
`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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

  const rows = parts as PartRow[];

  // -- JSON debug feed --------------------------------------------------------
  const jsonFeed = rows.map((p) => ({
    id: p.sku || p.id,
    title: p.name,
    description: sanitizeCustomerFacingCopy(p.description || "").slice(0, 5000),
    link: `${SITE_URL}/parts/${p.slug}`,
    image_link: productImageLink(p),
    price: p.price_cents ? `${(p.price_cents / 100).toFixed(2)} USD` : "0.00 USD",
    brand: getDisplayBrand(p.brand),
    mpn: p.oem_reference || p.sku || p.id,
    condition: "new",
    availability: p.is_in_stock ? "in stock" : "out of stock",
    google_product_category: googleProductCategory(p.category),
    product_type: p.category || undefined,
    shipping_weight: shippingWeight(p.weight_lbs),
    identifier_exists: "no", // most aftermarket parts have no GTIN
    ...(hasFreeFreight(p)
      ? {
          shipping: [
            {
              country: "US",
              service: "Ground",
              price: "0.00 USD",
            },
          ],
        }
      : {}),
  }));

  const dir = "public/feed";
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  writeFileSync(
    "public/feed/google-merchant.json",
    JSON.stringify(jsonFeed, null, 2)
  );

  // -- XML/RSS feed (the format Google actually fetches) ---------------------
  const items = rows
    .map((p) => {
      const link = `${SITE_URL}/parts/${p.slug}`;
      const image = productImageLink(p);
      const price = p.price_cents
        ? `${(p.price_cents / 100).toFixed(2)} USD`
        : "0.00 USD";
      const availability = p.is_in_stock ? "in stock" : "out of stock";
      const gpc = googleProductCategory(p.category);
      const sw = shippingWeight(p.weight_lbs);

      return `    <item>
      <g:id>${escapeXml(p.sku || p.id)}</g:id>
      <title>${escapeXml(p.name)}</title>
      <description>${escapeXml(
        sanitizeCustomerFacingCopy(p.description || "").slice(0, 5000)
      )}</description>
      <link>${escapeXml(link)}</link>
      <g:image_link>${escapeXml(image)}</g:image_link>
      <g:price>${escapeXml(price)}</g:price>
      <g:brand>${escapeXml(getDisplayBrand(p.brand))}</g:brand>
      <g:mpn>${escapeXml(p.oem_reference || p.sku || p.id)}</g:mpn>
      <g:condition>new</g:condition>
      <g:availability>${escapeXml(availability)}</g:availability>
      <g:identifier_exists>no</g:identifier_exists>
${gpc ? `      <g:google_product_category>${escapeXml(gpc)}</g:google_product_category>\n` : ""}${
        p.category
          ? `      <g:product_type>${escapeXml(p.category)}</g:product_type>\n`
          : ""
      }${sw ? `      <g:shipping_weight>${escapeXml(sw)}</g:shipping_weight>\n` : ""}${shippingXml(
        p
      )}    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Flat Earth Equipment Product Feed</title>
    <link>${SITE_URL}</link>
    <description>Aftermarket forklift, JCB, charger module, rubber track, and lithium golf cart battery products.</description>
${items}
  </channel>
</rss>
`;

  writeFileSync("public/feed/google-merchant.xml", xml);

  // -- Summary ----------------------------------------------------------------
  const byCategory: Record<string, number> = {};
  let freeShipCount = 0;
  for (const r of rows) {
    const c = r.category || "(uncategorized)";
    byCategory[c] = (byCategory[c] || 0) + 1;
    if (hasFreeFreight(r)) freeShipCount += 1;
  }
  console.log(`✅ Merchant feed built (${rows.length} products)`);
  console.log("   public/feed/google-merchant.json");
  console.log("   public/feed/google-merchant.xml");
  console.log(`   Free-shipping items: ${freeShipCount}`);
  console.log("\n   Category breakdown:");
  for (const [c, n] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`     ${n.toString().padStart(4)} × ${c}`);
  }
}

buildFeed().catch((e) => {
  console.error("❌ Feed build failed:", e);
  process.exit(1);
});
