const topBrands = ['jlg','genie','toyota','jcb','hyster'];

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://www.flatearthequipment.com',
  generateRobotsTxt: true,
  transform: async (config, path) => ({
    loc: path,
    changefreq: 'weekly',
    priority: path.startsWith('/brand/') ? 0.7 : 0.5,
    lastmod: new Date().toISOString(),
  }),
  additionalPaths: async (config) => {
    const items = [];
    for (const slug of topBrands){
      items.push({ loc: `/brand/${slug}/serial-lookup` });
      items.push({ loc: `/brand/${slug}/fault-codes` });
      items.push({ loc: `/brand/${slug}/guide` });
    }
    return items;
  }
};

export default config; 