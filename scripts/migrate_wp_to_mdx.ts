import fs from 'fs';
import path from 'path';
import xml2js from 'xml2js';

// Paths
const xmlPath = 'scripts/data/flatearthequipment.WordPress.2025-05-08.xml';
const mdxDir = path.join('content', 'insights');

async function run() {
  const xml = fs.readFileSync(xmlPath, 'utf8');
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(xml);

  const items = result.rss.channel.item;
  items.forEach((item: any) => {
    try {
      const slug = item['wp:post_name'];
      const title = item.title;
      const content = item['content:encoded'];
      const date = item.pubDate;

      const filepath = path.join(mdxDir, `${slug}.mdx`);
      if (!fs.existsSync(filepath)) {
        console.log(`Skipping non-stub: ${slug}`);
        return;
      }

      // Handle date parsing more gracefully
      let formattedDate = '2025-05-12'; // Default date
      try {
        if (date) {
          const parsedDate = new Date(date);
          if (!isNaN(parsedDate.getTime())) {
            formattedDate = parsedDate.toISOString().split('T')[0];
          }
        }
      } catch (e) {
        console.warn(`Warning: Invalid date for ${slug}, using default date`);
      }

      const frontmatter = `---
` +
        `title: "${title.replace(/"/g, '\"')}"
` +
        `description: "${(item['excerpt:encoded'] || '').replace(/<[^>]+>/g, '').slice(0,160)}"
` +
        `slug: "${slug}"
` +
        `date: "${formattedDate}"
` +
        `---

`;

      const mdxContent = frontmatter + content;
      fs.writeFileSync(filepath, mdxContent, 'utf8');
      console.log(`Populated: ${filepath}`);
    } catch (error) {
      console.error(`Error processing item:`, error);
    }
  });
}

run().catch(console.error); 