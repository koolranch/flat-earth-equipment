import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';

export default function BreadcrumbsBrand({ slug, name }: { slug: string; name: string }){
  const items = [
    { name: 'Brands', href: '/brands' },
    { name, href: `/brand/${slug}` }
  ];
  const json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((it, i) => ({
      '@type': 'ListItem',
      'position': i+1,
      'name': it.name,
      'item': `https://www.flatearthequipment.com${it.href}`
    }))
  };
  return (
    <nav className="mb-4 text-sm">
      <ol className="flex flex-wrap gap-2 text-muted-foreground">
        <li><Link className="hover:underline" href='/brands'>Brands</Link></li>
        <li>/</li>
        <li><Link className="hover:underline" href={`/brand/${slug}`}>{name}</Link></li>
      </ol>
      <JsonLd json={json} />
    </nav>
  );
}
