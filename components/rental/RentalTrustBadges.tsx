import { FileText, LayoutGrid, MessageCircle, Package, type LucideIcon } from 'lucide-react';

const TILES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: FileText,
    title: 'Request a quote',
    body: 'Send the machine, the dates, and the job location. The rate comes back on the quote.',
  },
  {
    icon: LayoutGrid,
    title: 'Browse by category',
    body: 'Each category lists models by brand, lift height, and capacity.',
  },
  {
    icon: MessageCircle,
    title: 'Ask a question',
    body: 'Questions about a machine go through the contact page or (888) 392-9175.',
  },
  {
    icon: Package,
    title: 'Parts too',
    body: 'Running your own fleet? We ship replacement parts across the US. Freight is calculated at checkout.',
  },
];

export default function RentalTrustBadges() {
  return (
    <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-8">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {TILES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-slate-900">{title}</h3>
            <p className="text-sm leading-relaxed text-slate-600">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
