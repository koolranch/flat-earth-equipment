import Link from 'next/link';

const items = [
  { order: 1, title: 'Pre-Op: PPE & Controls', href: '/training/module-1' },
  { order: 2, title: 'Daily Inspection (8-Point)', href: '/training/module-2' },
  { order: 3, title: 'Balance & Load Handling', href: '/training/module-3' },
  { order: 4, title: 'Hazard Hunt', href: '/training/module-4' },
  { order: 5, title: 'Shutdown Sequence', href: '/training/module-5' }
];

export default function ModuleList() {
  return (
    <ol className="grid gap-3">
      {items.map(i => (
        <li key={i.order} className="rounded-lg border p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Module {i.order}</div>
            <div className="font-medium">{i.title}</div>
          </div>
          <Link className="rounded-md bg-slate-900 text-white px-3 py-2" href={i.href}>Open</Link>
        </li>
      ))}
    </ol>
  );
}
