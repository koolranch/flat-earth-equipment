import { supabaseServer } from "@/lib/supabase/server";
import { parseSpecsFromSlug } from "@/lib/chargers";
import ChargerFilters from "@/components/ChargerFilters";
import BrandSection from "@/components/BrandSection";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import FSIPChargerCard from "@/components/FSIPChargerCard";
import FilterChips from "@/components/FilterChips";
import Pagination from "@/components/Pagination";
import { generatePageAlternates } from '../seo-defaults';

export const revalidate = 60;

export const metadata = {
  title: "FSIP GREEN Series Battery Chargers | Flat Earth Equipment",
  description:
    "Browse FSIP GREEN Series industrial battery chargers. Filter by family, voltage, and current. Request a quote.",
  alternates: generatePageAlternates('/chargers'),
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  }
};

type SearchParams = { family?: string; v?: string; a?: string; page?: string };

async function fetchParts() {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("parts")
    .select("name,slug,brand,description,image_url,price,price_cents,sku,stripe_price_id")
    .eq("category_slug", "battery-chargers")
    .eq("brand", "FSIP")
    .order("slug", { ascending: true })
    .limit(1000);
  if (error) throw error;
  return data ?? [];
}

function unique<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

const PER_PAGE = 24;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const raw = await fetchParts();

  const enriched = raw.map((p) => ({ part: p, specs: parseSpecsFromSlug(p.slug) }));

  const families = unique(enriched.map(({ specs }) => specs.family).filter((f) => f !== "unknown")) as string[];

  const volts = unique(enriched.map(({ specs }) => specs.voltage).filter(Boolean) as number[]).sort(
    (a, b) => a - b
  );

  const amps = unique(enriched.map(({ specs }) => specs.current).filter(Boolean) as number[]).sort((a, b) => a - b);

  const fFamily = (searchParams.family ?? "").toLowerCase();
  const fV = searchParams.v ? Number(searchParams.v) : null;
  const fA = searchParams.a ? Number(searchParams.a) : null;

  const filtered = enriched.filter(({ specs }) => {
    if (fFamily && specs.family !== fFamily) return false;
    if (fV && specs.voltage !== fV) return false;
    if (fA && specs.current !== fA) return false;
    return true;
  });

  const page = Math.max(1, Number(searchParams.page || 1));
  const total = filtered.length;
  const start = (page - 1) * PER_PAGE;
  const end = start + PER_PAGE;
  const pageItems = filtered.slice(start, end);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { href: "/chargers", label: "Chargers" }, { href: "/chargers", label: "FSIP GREEN Series" }]} />
      <BrandSection title="FSIP GREEN Series Battery Chargers" subtitle="Rugged, fleet-ready industrial chargers. Filter by family, voltage, and current.">
        <ChargerFilters families={families} volts={volts} amps={amps} />
        <FilterChips />
      </BrandSection>

      <section>
        {pageItems.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-center text-neutral-600">
            No chargers match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map(({ part }) => (
              <FSIPChargerCard key={part.slug} part={part} />
            ))}
          </div>
        )}
      </section>

      <Pagination total={total} perPage={PER_PAGE} />
    </div>
  );
}


