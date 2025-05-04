#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { parse } from "json2csv";

const rows = [];
for (const f of readdirSync("ingest/json").filter(x => x.endsWith(".json"))) {
  const p = JSON.parse(readFileSync(`ingest/json/${f}`, "utf8"));
  rows.push({
    sku: p.sku,
    name: p.name,
    description: p.description_html,
    price: p.price,
    brand_name: p.brand,
    system_name: p.system,
    category_name: p.category,
    slug: p.slug
  });
}

writeFileSync("ingest/parts-upload.csv", parse(rows));
console.log(`✅  CSV ready: ingest/parts-upload.csv (${rows.length} rows)`);
