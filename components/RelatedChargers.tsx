import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";
import { parseSpecsFromSlug, currency } from "@/lib/chargers";

// Simple related logic: same family; fallback to same voltage; exclude current
export default async function RelatedChargers({ currentSlug }: { currentSlug: string }) {
  const sb = supabaseServer();

  // Get current part + specs
  const { data: current } = await sb
    .from("parts")
    .select("slug, name, brand, description, image_url, price, price_cents, sku")
    .eq("slug", currentSlug)
    .single();

  if (!current) return null;

  const curSpecs = parseSpecsFromSlug(current.slug);

  // Fetch candidates
  const { data: all, error } = await sb
    .from("parts")
    .select("slug, name, brand, description, image_url, price, price_cents, sku")
    .eq("category_slug", "battery-chargers")
    .eq("brand", "FSIP")
    .order("slug", { ascending: true })
    .limit(200);

  if (error || !all) return null;

  const candidates = all
    .filter((p) => p.slug !== currentSlug)
    .map((p) => ({ p, s: parseSpecsFromSlug(p.slug) }));

  let related = candidates.filter((x) => x.s.family === curSpecs.family);
  if (related.length < 6 && curSpecs.voltage) {
    related = related.concat(
      candidates.filter((x) => x.s.family !== curSpecs.family && x.s.voltage === curSpecs.voltage)
    );
  }

  // unique by slug, take up to 6
  const seen = new Set<string>();
  const items = [] as { p: any; s: any }[];
  for (const r of related) {
    if (seen.has(r.p.slug)) continue;
    seen.add(r.p.slug);
    items.push(r);
    if (items.length >= 6) break;
  }

  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold tracking-tight">You may also like</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ p, s }) => {
          const priceStr = currency(p.price ?? p.price_cents);
          return (
            <Link
              key={p.slug}
              href={`/chargers/${p.slug}`}
              className="group rounded-2xl border bg-white transition hover:shadow-md"
            >
              <div className="aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-neutral-400 text-sm">No image</div>
                )}
              </div>
              <div className="p-4">
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-neutral-600">
                  {s.family && <span className="rounded-full bg-neutral-100 px-2 py-1">{s.family.toUpperCase()}</span>}
                  {s.voltage && <span className="rounded-full bg-neutral-100 px-2 py-1">{s.voltage} V</span>}
                  {s.current && <span className="rounded-full bg-neutral-100 px-2 py-1">{s.current} A</span>}
                </div>
                <div className="mt-2 text-sm font-medium">
                  {priceStr ? priceStr : <span className="text-neutral-500">Call for pricing</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}


