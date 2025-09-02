import fs from 'node:fs/promises';
import path from 'node:path';

export function mdxPath(locale: 'en'|'es', slug: string){
  const root = process.cwd();
  return path.join(root, 'content', 'training', locale, `${slug}.mdx`);
}

export async function loadMdxWithFallback(slug: string, preferred: 'en'|'es' = 'en'){
  const order: ('en'|'es')[] = preferred === 'es' ? ['es','en'] : ['en','es'];
  for (const loc of order){
    try {
      const p = mdxPath(loc, slug);
      const src = await fs.readFile(p, 'utf8');
      return { source: src, locale: loc };
    } catch { /* try next */ }
  }
  return { source: '# Coming soon', locale: 'en' as const };
}
