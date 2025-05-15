import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INSIGHTS_DIR = path.join(__dirname, '..', 'content', 'insights');
const FRONTMATTER_FIELDS = ['title', 'description', 'slug', 'date'];

function getAllMdxFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllMdxFiles(filePath));
    } else if (file.endsWith('.mdx')) {
      results.push(filePath);
    }
  });
  return results;
}

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---([\s\S]*?)---/);
  if (!match) return {};
  const frontmatter: Record<string, string> = {};
  match[1].split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) {
      frontmatter[key.trim()] = rest.join(':').trim().replace(/^"|"$/g, '');
    }
  });
  return frontmatter;
}

function checkForUnconvertedHtml(content: string): boolean {
  // Look for common HTML tags
  return /<\/?[a-z][\s\S]*?>/i.test(content);
}

function checkForExternalImages(content: string): string[] {
  const matches = Array.from(content.matchAll(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/g));
  return matches.map(m => m[1]);
}

function checkForMissingAltText(content: string): boolean {
  return /!\[\]\(/.test(content);
}

function checkMdxFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const frontmatter = parseFrontmatter(content);
  const body = content.replace(/^---([\s\S]*?)---/, '').trim();

  const missingFields = FRONTMATTER_FIELDS.filter(f => !frontmatter[f]);
  const emptyBody = body.length === 0;
  const hasHtml = checkForUnconvertedHtml(body);
  const externalImages = checkForExternalImages(body);
  const missingAlt = checkForMissingAltText(body);

  return {
    filePath,
    missingFields,
    emptyBody,
    hasHtml,
    externalImages,
    missingAlt
  };
}

function main() {
  const mdxFiles = getAllMdxFiles(INSIGHTS_DIR);
  const results = mdxFiles.map(checkMdxFile);

  let issues = 0;
  results.forEach(r => {
    if (
      r.missingFields.length ||
      r.emptyBody ||
      r.hasHtml ||
      r.externalImages.length ||
      r.missingAlt
    ) {
      issues++;
      console.log(`\n=== Issues in: ${r.filePath} ===`);
      if (r.missingFields.length) console.log('Missing frontmatter:', r.missingFields.join(', '));
      if (r.emptyBody) console.log('Body is empty');
      if (r.hasHtml) console.log('Unconverted HTML detected');
      if (r.externalImages.length) console.log('External images:', r.externalImages.join(', '));
      if (r.missingAlt) console.log('Images with missing alt text detected');
    }
  });
  if (!issues) {
    console.log('All MDX files passed quality checks!');
  } else {
    console.log(`\n${issues} file(s) with issues found.`);
  }
}

main(); 