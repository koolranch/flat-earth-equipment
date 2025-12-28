import { type MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Internal Next.js and Vercel paths
          '/_next/',
          '/_vercel/',
          '/api/preview',
          // Search result pages - prevent index bloat
          '/*?keyword=*',
          '/*?q=*',
          '/*?search=*',
          // Admin and dashboard pages
          '/admin/',
          '/dashboard/',
          '/trainer/',
        ]
      }
    ],
    sitemap: 'https://flatearthequipment.com/sitemap.xml',
    host: 'https://flatearthequipment.com'
  };
}
