/**
 * Generate Merchant-safe cab glass product images (unique per SKU).
 *
 * Writes JPGs to public/images/parts/glass/{slug}.jpg and optionally
 * updates parts.image_url in Supabase.
 *
 * Usage:
 *   npx tsx scripts/generate-glass-product-images.ts
 *   npx tsx scripts/generate-glass-product-images.ts --update-db
 *   npx tsx scripts/generate-glass-product-images.ts --slug=bobcat-7120401-door-glass
 */

import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import {
  buildCabGlassProductImageSvg,
  type CabGlassProductImageInput,
} from "../lib/parts/cabGlassProductImageSvg";

dotenv.config({ path: path.resolve(process.cwd(), ".env.production.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const SITE_URL = "https://www.flatearthequipment.com";
const OUT_DIR = path.resolve(process.cwd(), "public/images/parts/glass");
const IMAGE_SIZE = 1200;

type PartRow = {
  slug: string;
  name: string;
  brand: string | null;
  oem_reference: string | null;
  sku: string | null;
  metadata: Record<string, unknown> | null;
};

function glassImageInput(part: PartRow): CabGlassProductImageInput {
  const meta = part.metadata ?? {};
  const oemPn =
    (typeof meta.oem_pn === "string" && meta.oem_pn) ||
    part.oem_reference ||
    part.sku ||
    part.slug;
  const glassType =
    typeof meta.glass_type === "string" && meta.glass_type
      ? meta.glass_type
      : "cab_glass";

  return {
    brand: part.brand || "Flat Earth Equipment",
    oemPn,
    glassType,
    color: typeof meta.color === "string" ? meta.color : undefined,
    material: typeof meta.material === "string" ? meta.material : undefined,
  };
}

async function renderJpg(part: PartRow): Promise<string> {
  const svg = buildCabGlassProductImageSvg(glassImageInput(part));
  const outPath = path.join(OUT_DIR, `${part.slug}.jpg`);
  const buffer = await sharp(Buffer.from(svg))
    .resize(IMAGE_SIZE, IMAGE_SIZE)
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
  writeFileSync(outPath, buffer);
  return `${SITE_URL}/images/parts/glass/${part.slug}.jpg`;
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
    .select("slug, name, brand, oem_reference, sku, metadata")
    .eq("category", "Cab Glass")
    .eq("sales_type", "direct")
    .gt("price_cents", 0)
    .order("slug");

  if (slugArg) query = query.eq("slug", slugArg);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("No Cab Glass parts found");

  console.log(`Generating ${data.length} cab glass image(s) → ${OUT_DIR}\n`);

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
      : `\n✅ Done — JPGs written (${data.length}). Re-run with --update-db to set parts.image_url, then rebuild merchant feed.`
  );
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
