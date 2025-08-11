#!/usr/bin/env tsx
import fs from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";
import { stringify } from "csv-stringify/sync";

const chemistries = ["Lead-acid", "AGM", "Gel", "Lithium"];

function kebab(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type Model = {
  family: string;
  v: number;
  a: number;
  phase: "1P" | "3P";
  inputs: string[];
  oemPN?: string | null;
};

const families: Record<
  string,
  {
    phase: "1P" | "3P";
    inputs: string[];
    volts: number[];
    amps: number[];
    validate?: (v: number, a: number) => boolean;
  }
> = {
  green2: { phase: "1P", inputs: ["110-120"], volts: [24, 36, 48, 80], amps: [70, 45, 40, 20] },
  green4: { phase: "1P", inputs: ["208-240"], volts: [24, 36, 48, 80, 96], amps: [120, 90, 75, 40, 35] },
  green6: { phase: "3P", inputs: ["208-240", "480", "600"], volts: [24, 36, 48, 80], amps: [150, 100] },
  green8: { phase: "3P", inputs: ["208-240", "480", "600"], volts: [24, 36, 48, 80], amps: [200, 130] },
  greenx: {
    phase: "3P",
    inputs: ["480", "600"],
    volts: [24, 36, 48, 80],
    amps: [250, 300, 160, 200],
    validate: (v, a) => (v <= 48 && (a === 250 || a === 300)) || (v === 80 && (a === 160 || a === 200)),
  },
};

async function extractOEMPNs(text: string) {
  const map = new Map<string, string>();
  // TODO: Add regex parsing for real OEM PNs if present in the PDF text
  return map;
}

function modelToPartsRow(m: Model) {
  const name = `${m.family.toUpperCase()} ${m.v}V ${m.a}A`;
  const slug = kebab(name);
  const sku = m.oemPN ?? `${m.family.toUpperCase()}-${m.v}V-${m.a}A`;
  const desc = [
    `${name} industrial battery charger.`,
    `Input phase: ${m.phase}.`,
    `Input voltage options: ${m.inputs.join(", ")}.`,
    `Supported chemistries: ${chemistries.join(", ")}.`,
    `GREEN Series by FSIP.`,
  ].join(" ");

  const now = new Date().toISOString();

  return {
    id: "",
    name,
    slug,
    price: "0.00",
    category: "Battery Chargers",
    brand: "FSIP",
    description: desc,
    sku,
    created_at: now,
    updated_at: now,
    image_url: "",
    price_cents: 0,
    stripe_price_id: "",
    has_core_charge: false,
    core_charge: "0.00",
    category_slug: "battery-chargers",
    featured: false,
    stripe_product_id: "",
    brand_logo_url: "",
  };
}

async function main() {
  const cliPath = process.argv[2];
  const envPath = process.env.GREEN_PDF_PATH;
  const defaultPath = path.resolve("docs/green-series.pdf");
  const pdfPath = cliPath ?? envPath ?? defaultPath;

  console.log("Using PDF:", pdfPath);
  let text = "";
  try {
    const buf = await fs.readFile(pdfPath);
    console.log("PDF bytes:", buf.byteLength);
    const parsed = await pdfParse(buf);
    text = parsed.text || "";
  } catch (e) {
    console.warn("Warning: Failed to parse PDF. Continuing without OEM part numbers.", e);
  }

  const pnIndex = text ? await extractOEMPNs(text) : new Map<string, string>();
  const models: Model[] = [];

  for (const fam of Object.keys(families)) {
    const cfg = families[fam];
    for (const v of cfg.volts) {
      for (const a of cfg.amps) {
        if (cfg.validate && !cfg.validate(v, a)) continue;
        const key = `${fam}-${v}-${a}`;
        models.push({
          family: fam,
          v,
          a,
          phase: cfg.phase,
          inputs: cfg.inputs,
          oemPN: pnIndex.get(key) ?? null,
        });
      }
    }
  }

  const rows = models.map(modelToPartsRow);

  const header = [
    "id",
    "name",
    "slug",
    "price",
    "category",
    "brand",
    "description",
    "sku",
    "created_at",
    "updated_at",
    "image_url",
    "price_cents",
    "stripe_price_id",
    "has_core_charge",
    "core_charge",
    "category_slug",
    "featured",
    "stripe_product_id",
    "brand_logo_url",
  ];

  const csv = stringify(rows, { header: true, columns: header });
  await fs.mkdir("data", { recursive: true });
  await fs.writeFile("data/parts_green_chargers.csv", csv, "utf8");
  console.log(`Wrote ${rows.length} rows to data/parts_green_chargers.csv`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


