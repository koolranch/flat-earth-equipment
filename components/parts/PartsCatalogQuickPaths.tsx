import Link from 'next/link';
import {
  AppWindow,
  Armchair,
  ArrowUpFromLine,
  BatteryCharging,
  Brush,
  Cog,
  Forklift,
  ScanSearch,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import {
  CATALOG_QUICK_PATHS,
  type CatalogQuickPathIcon,
} from '@/lib/parts/catalogQuery';

type Props = {
  heading: string;
};

const ICONS: Record<CatalogQuickPathIcon, LucideIcon> = {
  tracks: Cog,
  glass: AppWindow,
  lithium: BatteryCharging,
  chargerModules: Zap,
  jcb: Wrench,
  seats: Armchair,
  forks: Forklift,
  scissor: ArrowUpFromLine,
  brooms: Brush,
  machine: ScanSearch,
};

export default function PartsCatalogQuickPaths({ heading }: Props) {
  return (
    <section aria-labelledby="quick-paths-heading" className="mb-8">
      <h2
        id="quick-paths-heading"
        className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500"
      >
        {heading}
      </h2>
      {/* Two columns on phones so every category is visible without sideways scrolling; five across on desktop makes two even rows. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {CATALOG_QUICK_PATHS.map((path) => {
          const Icon = ICONS[path.icon];
          return (
            <Link
              key={path.href}
              href={path.href}
              className="group flex min-h-[44px] items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-[#F76511] hover:shadow-sm"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-orange-50 group-hover:text-[#F76511]"
                aria-hidden="true"
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <p className="text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#F76511]">
                  {path.label}
                </p>
                <p className="mt-0.5 text-xs leading-snug text-slate-500">{path.description}</p>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
