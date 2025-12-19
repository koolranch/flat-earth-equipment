import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PartsCatalogItem {
  sku: string;
  name: string;
  slug: string;
  your_price: number | null;
  images: string[] | null;
  meta_description: string | null;
  in_stock: boolean;
  specs: Record<string, string | number> | null;
}

function escapeXml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function generateGoogleShoppingFeed(): Promise<string> {
  // Fetch chargers from parts_catalog
  const { data: products, error } = await supabase
    .from('parts_catalog')
    .select('sku, name, slug, your_price, images, meta_description, in_stock, specs')
    .eq('category_type', 'charger')
    .not('your_price', 'is', null)
    .order('name');

  if (error) {
    console.error('Error fetching products for Google Shopping feed:', error);
    throw new Error('Failed to fetch products');
  }

  const items = (products as PartsCatalogItem[]) || [];

  const xmlItems = items.map((item) => {
    const price = item.your_price ? `${item.your_price.toFixed(2)} USD` : '';
    const link = `https://www.flatearthequipment.com/chargers/${item.slug}`;
    const imageLink = item.images && item.images.length > 0 ? item.images[0] : '';
    const availability = item.in_stock ? 'in_stock' : 'out_of_stock';
    const description = item.meta_description || `${item.name} - Industrial battery charger from FSIP GREEN Series.`;

    return `    <item>
      <g:id>${escapeXml(item.sku)}</g:id>
      <title>${escapeXml(item.name)}</title>
      <description>${escapeXml(description)}</description>
      <link>${escapeXml(link)}</link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:price>${escapeXml(price)}</g:price>
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:brand>FSIP</g:brand>
      <g:product_type>Industrial Equipment &gt; Battery Chargers</g:product_type>
      <g:google_product_category>Electronics &gt; Power &gt; Battery Chargers</g:google_product_category>
    </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Flat Earth Equipment - Industrial Battery Chargers</title>
    <link>https://www.flatearthequipment.com/chargers</link>
    <description>Industrial battery chargers for forklifts and material handling equipment</description>
${xmlItems}
  </channel>
</rss>`;

  return xml;
}

export async function GET() {
  try {
    const xml = await generateGoogleShoppingFeed();

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Google Shopping feed error:', error);
    return new NextResponse('Error generating feed', { status: 500 });
  }
}

