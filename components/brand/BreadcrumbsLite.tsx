import Link from 'next/link';

interface BreadcrumbsLiteProps {
  slug: string;
  name: string;
}

export function BreadcrumbsLite({ slug, name }: BreadcrumbsLiteProps) {
  return (
    <nav className="mb-3 text-sm text-muted-foreground" aria-label="Breadcrumb">
      <ol className="flex flex-wrap gap-2 items-center">
        <li>
          <Link href="/brands" className="underline hover:no-underline">
            Brands
          </Link>
        </li>
        <li>/</li>
        <li>
          <Link href={`/brand/${slug}`} className="underline hover:no-underline">
            {name}
          </Link>
        </li>
      </ol>
    </nav>
  );
}
