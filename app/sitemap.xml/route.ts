export async function GET() {
  const pages = [
    '', // Homepage
    'parts',
    'rentals',
    'fleet',
    'contact',
    'about',
    'locations',
    'locations/cheyenne-wy',
    'locations/bozeman-mt',
    'locations/pueblo-co',
    'locations/las-cruces-nm',
    'brands',
    'quote',
    'insights',
    'forks',
    'parts-category',
    'osha-operator-training',
    'battery-charger-modules',
  ]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (path) => `
    <url>
      <loc>https://flatearthequipment.com/${path}</loc>
      <changefreq>weekly</changefreq>
      <priority>${path === '' ? '1.0' : '0.8'}</priority>
    </url>`
    )
    .join('')}
</urlset>`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
} 