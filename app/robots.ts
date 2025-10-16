import { type MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: ['/_next/', '/_vercel/', '/api/preview']
      }
    ],
    sitemap: 'https://flatearthequipment.com/sitemap.xml'
  };
}
