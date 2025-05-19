import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import axios from 'axios';
import { promisify } from 'util';
import { pipeline } from 'stream';

const pipelineAsync = promisify(pipeline);
const contentDir = path.join(process.cwd(), '..', 'content', 'insights');
const publicDir = path.join(process.cwd(), '..', 'public', 'images', 'insights');

// Ensure the public images directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function downloadImage(url: string, filename: string): Promise<string> {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  // Explicitly type response.data as NodeJS.ReadableStream for TypeScript
  const stream = response.data as NodeJS.ReadableStream;
  const filePath = path.join(publicDir, filename);
  await pipelineAsync(stream, fs.createWriteStream(filePath));
  return `/images/insights/${filename}`;
}

function generateImageFilename(url: string): string {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const extension = path.extname(pathname) || '.jpg';
  const filename = path.basename(pathname, extension);
  const timestamp = Date.now();
  return `${filename}-${timestamp}${extension}`;
}

function processMdxFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { data, content: mdxContent } = matter(content);

  // Find all image URLs in the content
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  let newContent = mdxContent;
  let hasChanges = false;

  while ((match = imageRegex.exec(mdxContent)) !== null) {
    const [fullMatch, altText, imageUrl] = match;
    if (imageUrl.startsWith('http')) {
      const filename = generateImageFilename(imageUrl);
      const localPath = `/images/insights/${filename}`;
      newContent = newContent.replace(fullMatch, `![${altText}](${localPath})`);
      hasChanges = true;

      // Download the image
      downloadImage(imageUrl, filename)
        .then(() => console.log(`Downloaded image: ${filename}`))
        .catch((error) => console.error(`Error downloading image ${imageUrl}:`, error));
    }
  }

  if (hasChanges) {
    const newMdxContent = matter.stringify(newContent, data);
    fs.writeFileSync(filePath, newMdxContent);
    console.log(`Updated images in ${path.basename(filePath)}`);
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
console.log('Processing MDX files for external images...');
walkDir(contentDir);
console.log('Done!'); 