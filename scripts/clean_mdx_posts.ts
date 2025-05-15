import fs from 'fs';
import path from 'path';

const insightsDirectory = path.join(process.cwd(), 'content/insights');

function cleanWordPressContent(content: string): string {
  // Remove WordPress HTML comments
  content = content.replace(/<!-- wp:.*? -->/g, '');
  content = content.replace(/<!-- \/wp:.*? -->/g, '');
  
  // Clean up HTML tags while preserving content
  content = content.replace(/<p>/g, '');
  content = content.replace(/<\/p>/g, '\n\n');
  content = content.replace(/<h2 class="wp-block-heading">/g, '## ');
  content = content.replace(/<\/h2>/g, '\n\n');
  content = content.replace(/<h3 class="wp-block-heading">/g, '### ');
  content = content.replace(/<\/h3>/g, '\n\n');
  content = content.replace(/<ul class="wp-block-list">/g, '');
  content = content.replace(/<\/ul>/g, '\n\n');
  content = content.replace(/<li>/g, '- ');
  content = content.replace(/<\/li>/g, '\n');
  content = content.replace(/<strong>/g, '**');
  content = content.replace(/<\/strong>/g, '**');
  content = content.replace(/<em>/g, '*');
  content = content.replace(/<\/em>/g, '*');
  content = content.replace(/<hr class="wp-block-separator has-alpha-channel-opacity"\/>/g, '---\n');
  
  // Clean up table formatting
  content = content.replace(/<figure class="wp-block-table"><table class="has-fixed-layout"><tbody>/g, '');
  content = content.replace(/<\/tbody><\/table><\/figure>/g, '\n\n');
  content = content.replace(/<tr>/g, '');
  content = content.replace(/<\/tr>/g, '\n');
  content = content.replace(/<th>/g, '| ');
  content = content.replace(/<\/th>/g, ' |');
  content = content.replace(/<td>/g, '| ');
  content = content.replace(/<\/td>/g, ' |');
  
  // Clean up any remaining HTML tags
  content = content.replace(/<[^>]+>/g, '');
  
  // Clean up extra newlines
  content = content.replace(/\n{3,}/g, '\n\n');
  
  return content;
}

async function cleanAllPosts() {
  const files = fs.readdirSync(insightsDirectory);
  
  for (const file of files) {
    if (!file.endsWith('.mdx')) continue;
    
    const filePath = path.join(insightsDirectory, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Split frontmatter and content
    const frontmatterEnd = content.indexOf('---', 3);
    if (frontmatterEnd === -1) {
      console.error(`No frontmatter found in ${file}`);
      continue;
    }
    
    const frontmatter = content.slice(0, frontmatterEnd + 3);
    const postContent = content.slice(frontmatterEnd + 3);
    
    // Clean the content
    const cleanedContent = cleanWordPressContent(postContent);
    
    // Write back to file
    fs.writeFileSync(filePath, frontmatter + '\n' + cleanedContent);
    console.log(`Cleaned ${file}`);
  }
}

cleanAllPosts().catch(console.error); 