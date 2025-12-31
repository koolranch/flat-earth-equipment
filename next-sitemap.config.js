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

// Brands that have working serial lookup tools (must match page.tsx)
const BRANDS_WITH_SERIAL_TOOLS = new Set([
  'toyota', 'hyster', 'bobcat', 'crown', 'clark', 'cat', 'caterpillar',
  'doosan', 'jlg', 'karcher', 'factory-cat', 'factorycat', 'tennant',
  'haulotte', 'yale', 'raymond', 'ep', 'ep-equipment', 'linde',
  'mitsubishi', 'komatsu', 'case', 'case-construction', 'new-holland',
  'takeuchi', 'kubota', 'toro', 'xcmg', 'sinoboom', 'skyjack',
  'jungheinrich', 'gehl', 'hangcha', 'lull', 'manitou', 'unicarriers',
  'jcb', 'genie', 'hyundai'
]);

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
    // All brands for fault-codes and guide pages (available for all brands)
    const allBrands = ['jlg','genie','toyota','jcb','hyster','crown','clark','yale','raymond','cat','komatsu','doosan','mitsubishi','linde','jungheinrich','bobcat','case','new-holland','kubota','takeuchi', ...scaled];
    const items = [];
    
    for (const slug of allBrands){
      // Only add serial-lookup for brands that have the tool implemented
      if (BRANDS_WITH_SERIAL_TOOLS.has(slug)) {
        items.push({ loc: `/brand/${slug}/serial-lookup` });
        items.push({ loc: `/es/brand/${slug}/serial-lookup` });
      }
      // Fault codes and guide pages are available for all brands
      items.push({ loc: `/brand/${slug}/fault-codes` });
      items.push({ loc: `/brand/${slug}/guide` });
      items.push({ loc: `/es/brand/${slug}/fault-codes` });
      items.push({ loc: `/es/brand/${slug}/guide` });
    }
    return items;
  }
};

export default config; 