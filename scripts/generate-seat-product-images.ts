/**
 * Generate Merchant-safe seat / cushion / cover product images (unique per SKU).
 *
 * Writes JPGs to public/images/parts/seats/{slug}.jpg.
 * By default does NOT update parts.image_url — seat PDPs stay empty until
 * real product photography exists (brand logos / vendor screenshots are banned).
 *
 * Usage:
 *   npx tsx scripts/generate-seat-product-images.ts
 *   npx tsx scripts/generate-seat-product-images.ts --slug=toyota-53720-u2231-71-seat-assembly
 *   npx tsx scripts/generate-seat-product-images.ts --update-db   # only if you intentionally want cards on PDPs
 */

import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import {
  buildSeatProductImageSvg,
  type SeatProductImageInput,
} from "../lib/parts/seatProductImageSvg";

dotenv.config({ path: path.resolve(process.cwd(), ".env.production.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const SITE_URL = "https://www.flatearthequipment.com";
const OUT_DIR = path.resolve(process.cwd(), "public/images/parts/seats");
const IMAGE_SIZE = 1200;
const SEAT_CATEGORIES = ["Seats", "Seat cushions", "Seat covers"] as const;

type PartRow = {
  slug: string;
  name: string;
  brand: string | null;
  category: string | null;
  oem_reference: string | null;
  sku: string | null;
  metadata: Record<string, unknown> | null;
};

function seatImageInput(part: PartRow): SeatProductImageInput {
  const meta = part.metadata ?? {};
  const oemPn =
    (typeof meta.oem_pn === "string" && meta.oem_pn) ||
    part.oem_reference ||
    part.sku ||
    part.slug;
  const productType =
    typeof meta.product_type === "string"
      ? meta.product_type
      : typeof meta.type === "string"
        ? meta.type
        : undefined;
  const material =
    typeof meta.material === "string"
      ? meta.material
      : typeof meta.filling === "string"
        ? meta.filling
        : undefined;

  return {
    brand: part.brand || "Flat Earth Equipment",
    oemPn,
    category: part.category || "Seats",
    productType,
    material,
  };
}

async function renderJpg(part: PartRow): Promise<string> {
  const svg = buildSeatProductImageSvg(seatImageInput(part));
  const outPath = path.join(OUT_DIR, `${part.slug}.jpg`);
  const buffer = await sharp(Buffer.from(svg))
    .resize(IMAGE_SIZE, IMAGE_SIZE)
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
  writeFileSync(outPath, buffer);
  return `${SITE_URL}/images/parts/seats/${part.slug}.jpg`;
}

async function main() {
  const updateDb = process.argv.includes("--update-db");
  const slugArg = process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1];

  mkdirSync(OUT_DIR, { recursive: true });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let query = supabase
    .from("parts")
    .select("slug, name, brand, category, oem_reference, sku, metadata")
    .in("category", [...SEAT_CATEGORIES])
    .eq("sales_type", "direct")
    .gt("price_cents", 0)
    .order("slug");

  if (slugArg) query = query.eq("slug", slugArg);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("No priced seat parts found");

  console.log(`Generating ${data.length} seat image(s) → ${OUT_DIR}\n`);

  for (const part of data as PartRow[]) {
    const imageUrl = await renderJpg(part);
    console.log(`  ✓ ${part.slug}.jpg`);

    if (updateDb) {
      const { error: updateError } = await supabase
        .from("parts")
        .update({ image_url: imageUrl })
        .eq("slug", part.slug);
      if (updateError) throw new Error(`${part.slug}: ${updateError.message}`);
    }
  }

  console.log(
    updateDb
      ? `\n✅ Done — JPGs written and parts.image_url updated (${data.length} SKUs)`
      : `\n✅ Done — JPGs written (${data.length}). Feed will use these; PDPs keep empty image_url until real photos.`
  );
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
