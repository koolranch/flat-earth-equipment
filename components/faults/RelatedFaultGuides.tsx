import Link from 'next/link';

type GuideLink = {
  href: string;
  title: string;
  blurb: string;
};

const JCB_RELATED_GUIDES: GuideLink[] = [
  {
    href: '/insights/jcb-service-master-fault-codes-list-and-manual-reset',
    title: 'JCB Service Master fault codes & manual reset',
    blurb: 'Active vs stored codes, key-cycle resets, and when you still need the dealer laptop.',
  },
  {
    href: '/insights/jcb-p-0087-fuel-rail-pressure-too-low-scv-valve-diagnosis',
    title: 'P0087 fuel rail pressure diagnosis',
    blurb: 'Filter-first troubleshooting for the most common low-pressure fuel code.',
  },
  {
    href: '/jcb-serial-number-lookup',
    title: 'JCB serial number lookup',
    blurb: 'Confirm model/year before ordering sensors, filters, or fuel-system parts.',
  },
  {
    href: '/brand/jcb',
    title: 'JCB brand hub',
    blurb: 'Serial lookup, fault codes, and parts help in one place.',
  },
];

export default function RelatedFaultGuides({
  brandName = 'JCB',
  guides = JCB_RELATED_GUIDES,
}: {
  brandName?: string;
  guides?: GuideLink[];
}) {
  return (
    <section className="mt-10" aria-labelledby="related-guides-heading">
      <h2 id="related-guides-heading" className="text-xl font-semibold text-slate-900 mb-2">
        Related {brandName} guides
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Deeper write-ups that already help operators diagnose before they order parts.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {guides.map((g) => (
          <li key={g.href}>
            <Link
              href={g.href}
              className="block h-full rounded-xl border bg-white p-4 hover:border-[#F76511] transition-colors"
            >
              <div className="font-medium text-slate-900">{g.title}</div>
              <p className="text-sm text-muted-foreground mt-1">{g.blurb}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
