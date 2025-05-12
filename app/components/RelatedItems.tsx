import Link from "next/link";

interface RelatedItem { title: string; href: string; }
interface RelatedItemsProps { items: RelatedItem[]; }

export default function RelatedItems({ items }: RelatedItemsProps) {
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-semibold mb-4">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block p-4 bg-white rounded-xl shadow hover:shadow-md transition"
          >
            <h3 className="text-lg font-medium">{item.title}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
} 