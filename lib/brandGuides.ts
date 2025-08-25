import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'content', 'brand-guides');

export function hasBrandGuide(slug: string){
  const p = path.join(DIR, `${slug}.mdx`);
  return fs.existsSync(p);
}

export function getBrandGuide(slug: string){
  const file = path.join(DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const { content } = matter(raw);
  return { content };
}
