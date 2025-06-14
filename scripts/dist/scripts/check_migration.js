"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
// 1) Read your Top Pages CSV
var csvPath = 'scripts/data/flatearthequipment.com-top-pages-subdomains_2025-05-08_13-01-43.csv';
if (!fs_1.default.existsSync(csvPath)) {
    console.error("CSV not found at ".concat(csvPath));
    process.exit(1);
}
var csv = fs_1.default.readFileSync(csvPath, 'utf8');
var _a = csv.trim().split('\n'), header = _a[0], rows = _a.slice(1);
var urlIndex = header.split('\t').findIndex(function (h) { return h.toLowerCase() === 'url'; });
if (urlIndex === -1) {
    console.error('No "URL" column found in CSV header.');
    process.exit(1);
}
// 2) Extract top-page slugs from URLs
var topSlugs = rows
    .map(function (r) {
    var cols = r.split('\t');
    var url = cols[urlIndex].trim();
    // Extract slug from URL by removing domain and trailing slash
    var slug = url.replace('https://flatearthequipment.com/', '').replace(/\/$/, '');
    return slug;
})
    .filter(Boolean);
// 3) Read your MDX posts directory
var mdxDir = path_1.default.join('content', 'insights');
var mdxFiles = fs_1.default.existsSync(mdxDir)
    ? fs_1.default.readdirSync(mdxDir).filter(function (f) { return f.endsWith('.mdx'); })
    : [];
var mdxSlugs = mdxFiles.map(function (f) { return f.replace(/\.mdx$/, ''); });
// 4) Compute missing slugs
var missing = topSlugs.filter(function (s) { return !mdxSlugs.includes(s); });
// 5) Output report
console.log('\n=== Top Pages Migration Report ===');
console.log("Total Top-100 slugs: ".concat(topSlugs.length));
console.log("MDX posts found: ".concat(mdxSlugs.length));
console.log('Missing slugs:\n', missing.length ? missing.join('\n') : 'None 🎉');
