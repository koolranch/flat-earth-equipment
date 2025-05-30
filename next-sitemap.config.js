/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://www.flatearthequipment.com',
  generateRobotsTxt: true,
  exclude: [
    '/dashboard',
    '/dashboard/*',
    '/verify/*',
    '/api/*',
    '/_next/*',
    '/404',
    '/500',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/verify/*',
          '/api/*',
          '/_next/*',
        ],
      },
    ],
    additionalSitemaps: [
      'https://www.flatearthequipment.com/sitemap.xml',
    ],
  },
  generateIndexSitemap: true,
  autoLastmod: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 7000,
  transform: async (config, path) => {
    // Custom priority for different page types
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      }
    }
    
    // Higher priority for safety pages
    if (path.startsWith('/safety')) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      }
    }
    
    // State-specific forklift pages
    if (path.includes('/safety/forklift/')) {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.8,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      }
    }
    
    // Default transformation
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }
  },
}

export default config 