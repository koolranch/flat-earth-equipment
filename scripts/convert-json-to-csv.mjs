import fs from 'fs';
import path from 'path';
import { Parser } from 'json2csv';

const inputDir = 'ingest/json';
const outputFile = 'data/parts.csv';

// Read all JSON files
const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.json'));
const parts = files.map(file => {
  const content = fs.readFileSync(path.join(inputDir, file), 'utf8');
  return JSON.parse(content);
});

// Convert to CSV
const fields = ['name', 'slug', 'price', 'category', 'brand', 'description', 'sku'];
const parser = new Parser({ fields });
const csv = parser.parse(parts);

// Write to file
fs.writeFileSync(outputFile, csv);
console.log('✅ Successfully converted JSON to CSV'); 