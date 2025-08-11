import Link from "next/link";

export default function Breadcrumbs({ items }: { items: Array<{ href?: string; label: string }> }){
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-[var(--brand-muted)]">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {it.href ? (
              <Link href={it.href} className="hover:underline">{it.label}</Link>
            ) : (
              <span className="text-[var(--brand-ink)] font-medium">{it.label}</span>
            )}
            {i < items.length - 1 && <span className="mx-1">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}