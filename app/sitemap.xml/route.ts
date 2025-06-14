import { createClient } from '@/utils/supabase/server'
import { forkliftStates, ForkliftStateInfo } from "@/src/data/forkliftStates"

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
    'safety', // Main forklift course page
    'safety/forklift', // State directory page
  ]

  // Generate URLs for categories
  const categoryUrls = uniqueCategories.map((cat: Category) => `parts/category/${cat.category_slug}`)

  // Generate URLs for products
  const productUrls = products?.map((prod: Product) => `parts/${prod.slug}`) || []

  // Generate URLs for state-specific forklift pages
  const forkliftStateUrls = forkliftStates.map((state: ForkliftStateInfo) => `safety/forklift/${state.code}`)

  const allUrls = [...staticPages, ...categoryUrls, ...productUrls, ...forkliftStateUrls]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls
    .map(
      (path) => `
    <url>
      <loc>https://flatearthequipment.com/${path}</loc>
      <changefreq>weekly</changefreq>
      <priority>${path === '' ? '1.0' : path.startsWith('parts/') ? '0.9' : path.startsWith('safety/forklift/') ? '0.8' : '0.7'}</priority>
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