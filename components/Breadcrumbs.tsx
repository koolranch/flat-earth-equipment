import Link from "next/link";

type Item = { href?: string; label: string };
type Props = { items?: Item[]; trail?: { href: string; label: string }[] };

export default function Breadcrumbs({ items, trail }: Props){
  const list: Item[] = items ?? trail ?? [];
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-[var(--brand-muted)]">
        {list.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {it.href ? (
              <Link href={it.href} className="hover:underline">{it.label}</Link>
            ) : (
              <span className="text-[var(--brand-ink)] font-medium">{it.label}</span>
            )}
            {i < list.length - 1 && <span className="mx-1">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}