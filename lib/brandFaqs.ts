import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
const ROOT = process.cwd();
const DIR = path.join(ROOT, 'content', 'brand-faqs');
export function getBrandFaq(slug: string){
  const p = path.join(DIR, `${slug}.mdx`);
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf8');
  const { content, data } = matter(raw);
  return { content, data: data || {} };
}
export function hasBrandFaq(slug: string){
  return fs.existsSync(path.join(DIR, `${slug}.mdx`));
}
