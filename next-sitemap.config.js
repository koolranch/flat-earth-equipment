import fs from 'fs';
import path from 'path';
function loadScale(){
  try{
    const p = path.join(process.cwd(),'content','brands-scale.json');
    const j = JSON.parse(fs.readFileSync(p,'utf8'));
    return (j.brands||[]).map(b=>b.slug);
  }catch(e){ return []; }
}
const scaled = loadScale();

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://www.flatearthequipment.com',
  generateRobotsTxt: true,
  alternateRefs: [
    { href: 'https://www.flatearthequipment.com', hreflang: 'en-US' },
    { href: 'https://www.flatearthequipment.com/es', hreflang: 'es-US' }
  ],
  transform: async (config, path) => ({
    loc: path,
    changefreq: 'weekly',
    priority: path.startsWith('/brand/') || path.startsWith('/es/brand/') ? 0.7 : 0.5,
    lastmod: new Date().toISOString(),
  }),
  additionalPaths: async (config) => {
    const base = ['jlg','genie','toyota','jcb','hyster', ...scaled];
    const items = [];
    for (const slug of base){
      items.push({ loc: `/brand/${slug}/serial-lookup` });
      items.push({ loc: `/brand/${slug}/fault-codes` });
      items.push({ loc: `/brand/${slug}/guide` });
      items.push({ loc: `/es/brand/${slug}/serial-lookup` });
      items.push({ loc: `/es/brand/${slug}/fault-codes` });
      items.push({ loc: `/es/brand/${slug}/guide` });
    }
    return items;
  }
};

export default config; 