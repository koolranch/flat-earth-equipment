import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'content', 'brand-guides');

export function hasBrandGuide(slug: string){
  const p = path.join(DIR, `${slug}.mdx`);
  return fs.existsSync(p);
}

export function BrandGuideMDX({ slug }: { slug: string }){
  const file = path.join(DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) {
    return (<div className="rounded-xl border p-4 bg-card text-sm text-muted-foreground">No guide available yet for this brand.</div>);
  }
  const raw = fs.readFileSync(file, 'utf8');
  const { content } = matter(raw);
  // MDXRemote for RSC is already included via next-mdx-remote/rsc dependency
  return <MDXRemote source={content} />;
}
