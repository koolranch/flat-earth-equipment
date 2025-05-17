import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import { compileMDX } from 'next-mdx-remote/rsc';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  keywords: string[];
  image: string;
  content: any; // Changed from string to any to match MDXRemoteSerializeResult
}

const insightsDirectory = path.join(process.cwd(), 'content/insights');

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const filePath = path.join(process.cwd(), 'content/insights', `${slug}.mdx`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    const mdxSource = await serialize(content);

    return {
      slug,
      title: data.title,
      date: data.date,
      description: data.description,
      keywords: data.keywords,
      image: data.image,
      content: mdxSource,
    };
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const postsDirectory = path.join(process.cwd(), 'content/insights');
  const files = fs.readdirSync(postsDirectory);
  
  const posts = await Promise.all(
    files
      .filter(file => file.endsWith('.mdx'))
      .map(async file => {
        const slug = file.replace(/\.mdx$/, '');
        const post = await getBlogPost(slug);
        return post;
      })
  );

  return posts.filter((post): post is BlogPost => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getMDXContent(slug: string) {
  try {
    const filePath = path.join(process.cwd(), 'content/insights', `${slug}.mdx`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    const { data, content } = matter(fileContent);
    const { content: compiledContent } = await compileMDX({
      source: content,
      options: { parseFrontmatter: true }
    });

    return {
      content: compiledContent,
      metadata: data
    };
  } catch (error) {
    console.error(`Error loading MDX content for ${slug}:`, error);
    return null;
  }
} 