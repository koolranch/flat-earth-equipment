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
          // Internal, password-gated operations tooling
          '/parts-watch',
        ]
      }
    ],
    sitemap: 'https://www.flatearthequipment.com/sitemap.xml',
    host: 'https://www.flatearthequipment.com'
  };
}
