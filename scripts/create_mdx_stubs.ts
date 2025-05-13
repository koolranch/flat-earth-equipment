import fs from 'fs';
import path from 'path';

const slugsFile = 'scripts/missing_slugs.txt';
const contentDir = path.join('content', 'insights');

if (!fs.existsSync(slugsFile)) {
  console.error('Missing slugs file not found:', slugsFile);
  process.exit(1);
}

const slugs = fs.readFileSync(slugsFile, 'utf8')
  .split(/\r?\n/)
  .map(s => s.trim())
  .filter(Boolean);

// Ensure content directory exists
if (!fs.existsSync(contentDir)) {
  fs.mkdirSync(contentDir, { recursive: true });
}

slugs.forEach(slug => {
  const filename = path.join(contentDir, `${slug}.mdx`);
  if (fs.existsSync(filename)) {
    console.log(`Skipping existing file: ${filename}`);
    return;
  }

  const frontmatter = `---
` +
    `title: "TBD"
` +
    `description: "Placeholder for ${slug}"
` +
    `slug: "${slug}"
` +
    `date: "2025-05-12"
` +
    `---
\n` +
    `Content coming soon for ${slug}...`;

  fs.writeFileSync(filename, frontmatter);
  console.log(`Created MDX stub: ${filename}`);
}); 