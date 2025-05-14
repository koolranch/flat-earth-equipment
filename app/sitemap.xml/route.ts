import { createClient } from '@/utils/supabase/server'

interface Category {
  category_slug: string
}

interface Product {
  slug: string
}

export async function GET() {
  const supabase = createClient()

  // Get all categories
  const { data: categories } = await supabase
    .from('parts')
    .select('category_slug')
    .order('category_slug')

  // Get unique categories
  const uniqueCategories = Array.from(
    new Set(categories?.map(cat => cat.category_slug) || [])
  ).map(slug => ({ category_slug: slug }))

  // Get all product slugs
  const { data: products } = await supabase
    .from('parts')
    .select('slug')

  const staticPages = [
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

  // Generate URLs for categories
  const categoryUrls = uniqueCategories.map((cat: Category) => `parts/category/${cat.category_slug}`)

  // Generate URLs for products
  const productUrls = products?.map((prod: Product) => `parts/${prod.slug}`) || []

  const allUrls = [...staticPages, ...categoryUrls, ...productUrls]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls
    .map(
      (path) => `
    <url>
      <loc>https://flatearthequipment.com/${path}</loc>
      <changefreq>weekly</changefreq>
      <priority>${path === '' ? '1.0' : path.startsWith('parts/') ? '0.9' : '0.8'}</priority>
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