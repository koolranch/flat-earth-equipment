import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { JSDOM } from 'jsdom';
import slugify from 'slugify';
import { fileURLToPath } from 'url';

interface WordPressPost {
  [key: string]: any;
  title: string;
  content: string;
  date: string;
  categories: string[];
  slug: string;
}

interface WordPressExport {
  rss: {
    channel: {
      item: WordPressPost[];
    };
  };
}

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORDPRESS_EXPORT_PATH = path.join(__dirname, 'data', 'flatearthequipment.WordPress.2025-05-08.xml');
const OUTPUT_DIR = path.join(__dirname, '..', 'content', 'insights');

// Priority categories in order
const PRIORITY_CATEGORIES = [
  'diagnostic-codes',
  'parts',
  'rental'
];

// Helper function to convert HTML to MDX
function convertHtmlToMdx(html: string): string {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Convert headings
  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading: Element) => {
    const level = parseInt(heading.tagName[1]);
    heading.outerHTML = `\n${'#'.repeat(level)} ${heading.textContent}\n`;
  });

  // Convert paragraphs
  document.querySelectorAll('p').forEach((p: Element) => {
    p.outerHTML = `\n${p.textContent}\n`;
  });

  // Convert lists
  document.querySelectorAll('ul, ol').forEach((list: Element) => {
    const items = Array.from(list.querySelectorAll('li')).map((li: Element) => `- ${li.textContent}`).join('\n');
    list.outerHTML = `\n${items}\n`;
  });

  // Convert links
  document.querySelectorAll('a').forEach((link: Element) => {
    const href = (link as HTMLAnchorElement).href;
    link.outerHTML = `[${link.textContent}](${href})`;
  });

  // Convert images
  document.querySelectorAll('img').forEach((img: Element) => {
    const imgElement = img as HTMLImageElement;
    const alt = imgElement.alt || '';
    const src = imgElement.src;
    img.outerHTML = `\n![${alt}](${src})\n`;
  });

  return document.body.textContent || '';
}

// Helper function to generate frontmatter
function generateFrontmatter(post: { title: string; description: string; slug: string; date: string }): string {
  return `---
title: "${post.title}"
description: "${post.description}"
slug: "${post.slug}"
date: "${post.date}"
---
`;
}

// Main conversion function
async function convertWordPressToMdx() {
  try {
    // Read WordPress export
    const xmlContent = fs.readFileSync(WORDPRESS_EXPORT_PATH, 'utf-8');
    const parser = new XMLParser();
    const result = parser.parse(xmlContent) as WordPressExport;

    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Process posts
    const posts = result.rss.channel.item;
    console.log('First 5 posts:', JSON.stringify(posts.slice(0, 5), null, 2));

    // Collect and print all unique categories
    const uniqueCategories = new Set<string>();
    for (const post of posts) {
      if (post.category) {
        if (Array.isArray(post.category)) {
          post.category.forEach((cat: string) => uniqueCategories.add(cat));
        } else {
          uniqueCategories.add(post.category as string);
        }
      }
    }
    console.log('Unique categories found:', Array.from(uniqueCategories));

    let convertedCount = 0;

    for (const post of posts) {
      // Skip if no category
      if (!post.category) continue;

      // Handle category as string or array
      let mainCategory = '';
      if (Array.isArray(post.category)) {
        mainCategory = (post.category[0] as string).toLowerCase();
      } else {
        mainCategory = (post.category as string).toLowerCase();
      }

      // Skip if not in priority categories
      if (!PRIORITY_CATEGORIES.some(cat => mainCategory.includes(cat))) continue;

      // Create category directory
      const categoryDir = path.join(OUTPUT_DIR, mainCategory);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }

      // Generate slug if not present
      const slug = (post['wp:post_name'] && post['wp:post_name'].length > 0)
        ? post['wp:post_name']
        : slugify(post.title, { lower: true });

      // Convert content
      const mdxContent = convertHtmlToMdx(post['content:encoded'] || '');

      // Use post date
      const date = post['wp:post_date'] || '';

      // Create MDX file
      const outputPath = path.join(categoryDir, `${slug}.mdx`);
      const frontmatter = generateFrontmatter({
        title: post.title,
        description: post.title,
        slug: `${mainCategory}/${slug}`,
        date
      });

      fs.writeFileSync(outputPath, frontmatter + mdxContent);
      convertedCount++;

      console.log(`Converted: ${post.title}`);
    }

    console.log(`\nConversion complete! Converted ${convertedCount} posts.`);

  } catch (error) {
    console.error('Error during conversion:', error);
  }
}

// Run the conversion
convertWordPressToMdx(); 