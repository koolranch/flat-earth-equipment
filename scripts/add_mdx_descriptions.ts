import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), '..', 'content', 'insights');

function generateDescription(content: string): string {
  // Get the first paragraph of content
  const firstParagraph = content.split('\n\n')[0];
  // Remove markdown syntax
  const cleanText = firstParagraph
    .replace(/[#*`_~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
  // Limit to 160 characters
  return cleanText.length > 160 ? cleanText.substring(0, 157) + '...' : cleanText;
}

function processMdxFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { data, content: mdxContent } = matter(content);

  if (!data.description) {
    const description = generateDescription(mdxContent);
    const newFrontmatter = {
      ...data,
      description,
    };

    const newContent = matter.stringify(mdxContent, newFrontmatter);
    fs.writeFileSync(filePath, newContent);
    console.log(`Added description to ${path.basename(filePath)}`);
  }
}

function walkDir(dir: string) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.mdx')) {
      processMdxFile(filePath);
    }
  }
}

// Start processing
console.log('Adding missing descriptions to MDX files...');
walkDir(contentDir);
console.log('Done!'); 