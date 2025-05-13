import fs from 'fs';
import path from 'path';

// 1) Read your Top Pages CSV
const csvPath = 'scripts/data/flatearthequipment.com-top-pages-subdomains_2025-05-08_13-01-43.csv';
if (!fs.existsSync(csvPath)) {
  console.error(`CSV not found at ${csvPath}`);
  process.exit(1);
}
const csv = fs.readFileSync(csvPath, 'utf8');
const [header, ...rows] = csv.trim().split('\n');
const urlIndex = header.split('\t').findIndex(h => h.toLowerCase() === 'url');
if (urlIndex === -1) {
  console.error('No "URL" column found in CSV header.');
  process.exit(1);
}

// 2) Extract top-page slugs from URLs
const topSlugs = rows
  .map(r => {
    const cols = r.split('\t');
    const url = cols[urlIndex].trim();
    // Extract slug from URL by removing domain and trailing slash
    const slug = url.replace('https://flatearthequipment.com/', '').replace(/\/$/, '');
    return slug;
  })
  .filter(Boolean);

// 3) Read your MDX posts directory
const mdxDir = path.join('content', 'insights');
const mdxFiles = fs.existsSync(mdxDir)
  ? fs.readdirSync(mdxDir).filter(f => f.endsWith('.mdx'))
  : [];
const mdxSlugs = mdxFiles.map(f => f.replace(/\.mdx$/, ''));

// 4) Compute missing slugs
const missing = topSlugs.filter(s => !mdxSlugs.includes(s));

// 5) Output report
console.log('\n=== Top Pages Migration Report ===');
console.log(`Total Top-100 slugs: ${topSlugs.length}`);
console.log(`MDX posts found: ${mdxSlugs.length}`);
console.log('Missing slugs:\n', missing.length ? missing.join('\n') : 'None 🎉'); 