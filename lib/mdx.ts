import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  keywords: string[];
  image: string;
  content: string;
};

const insightsDirectory = path.join(process.cwd(), 'content/insights');

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(insightsDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    const mdxSource = await serialize(content);

    return {
      slug,
      title: data.title,
      description: data.description,
      date: data.date,
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
  try {
    const files = fs.readdirSync(insightsDirectory);
    const posts = await Promise.all(
      files
        .filter((file) => file.endsWith('.mdx'))
        .map(async (file) => {
          const slug = file.replace(/\.mdx$/, '');
          const post = await getBlogPost(slug);
          return post;
        })
    );

    return posts
      .filter((post): post is BlogPost => post !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
} 