import Link from 'next/link'

export default function Breadcrumbs({ trail }: { trail: { href: string, label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="py-2 px-4 text-sm text-slate-600">
      <ol className="inline-flex space-x-1">
        {trail.map((node, i) => (
          <li key={i} className="flex items-center">
            <Link href={node.href} className="hover:underline">
              {node.label}
            </Link>
            {i < trail.length - 1 && <span className="mx-1 text-slate-400">›</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
} 