import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { CART_MODELS, getCartModel, type CartModel } from '@/constants/golfCartModels';
import {
  Battery,
  ShieldCheck,
  Truck,
  Wrench,
  Award,
  ArrowLeft,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { generatePageAlternates } from '@/app/seo-defaults';

const SITE_URL = 'https://www.flatearthequipment.com';

export const dynamic = 'force-static';
export const dynamicParams = false; // only the slugs we define exist

export async function generateStaticParams() {
  return CART_MODELS.map((c) => ({ cart: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { cart: string };
}): Promise<Metadata> {
  const cart = getCartModel(params.cart);
  if (!cart) return { title: 'Not Found' };

  const title = `${cart.fullName} Lithium Battery Conversion | LiFePO4 Drop-In Kit`;
  const description = `${cart.fullName} (${cart.yearRange}) lithium battery upgrade. Drop-in LiFePO4 conversion kit with charger, DC converter, LCD display, and mounting hardware. ${cart.rangeEstimate}. 8-year warranty, free shipping on 3+.`;
  const ogImage = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products/lithium-rhino.png';

  return {
    title,
    description,
    keywords: [
      `${cart.fullName} lithium battery`,
      `${cart.fullName} lithium conversion`,
      `${cart.fullName} LiFePO4`,
      `${cart.brand} ${cart.model} lithium upgrade`,
      `${cart.brand} lithium battery`,
      `${cart.voltage} lithium golf cart battery`,
      'golf cart battery conversion kit',
    ].join(', '),
    alternates: generatePageAlternates(`/lithium-batteries/${params.cart}`),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/lithium-batteries/${params.cart}`,
      images: [{ url: ogImage, width: 1200, height: 1200, alt: `${cart.fullName} lithium battery conversion` }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [ogImage],
    },
  };
}

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

type BatteryRow = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  image_url: string | null;
  weight_lbs: number | null;
  metadata: any;
  description: string | null;
};

async function getBatteriesByFsipSku(skus: string[]): Promise<Map<string, BatteryRow>> {
  if (skus.length === 0) return new Map();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('parts')
    .select('id, name, slug, sku, price, image_url, weight_lbs, metadata, description')
    .in('sku', skus);
  const map = new Map<string, BatteryRow>();
  for (const b of (data || []) as BatteryRow[]) map.set(b.sku, b);
  return map;
}

export default async function CartLithiumLanding({
  params,
}: {
  params: { cart: string };
}) {
  const cart = getCartModel(params.cart);
  if (!cart) notFound();

  // Fetch the recommended SKUs from Supabase (single round-trip)
  const allSkus = [
    cart.recommendedSkus.primary,
    cart.recommendedSkus.budget,
    cart.recommendedSkus.extendedRange,
  ].filter(Boolean) as string[];
  const batteries = await getBatteriesByFsipSku(allSkus);

  const primary = batteries.get(cart.recommendedSkus.primary);
  const budget = cart.recommendedSkus.budget ? batteries.get(cart.recommendedSkus.budget) : undefined;
  const extended = cart.recommendedSkus.extendedRange
    ? batteries.get(cart.recommendedSkus.extendedRange)
    : undefined;

  if (!primary) notFound();

  // Other cart models (excluding current) for "Browse by cart" footer
  const otherCarts = CART_MODELS.filter((c) => c.slug !== cart.slug)
    .sort((a, b) => {
      const order: Record<string, number> = { High: 0, Medium: 1, Niche: 2 };
      return order[a.popularity] - order[b.popularity];
    })
    .slice(0, 9);

  return (
    <main className="container mx-auto px-4 lg:px-8 py-12 space-y-12 pb-20">
      {/* ─────────── Schemas ─────────── */}
      <Script
        id={`cart-product-ld-${cart.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: `${cart.fullName} Lithium Battery Conversion Kit (${primary.name})`,
            description: primary.description?.slice(0, 1500) || '',
            sku: primary.sku,
            mpn: primary.sku,
            image: primary.image_url || undefined,
            url: `${SITE_URL}/lithium-batteries/${cart.slug}`,
            brand: { '@type': 'Brand', name: 'Lithium Rhino' },
            category: 'Lithium Batteries',
            offers: {
              '@type': 'Offer',
              price: primary.price.toFixed(2),
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              url: `${SITE_URL}/parts/${primary.slug}`,
              priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
            },
          }),
        }}
      />

      <Script
        id={`cart-breadcrumb-ld-${cart.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Parts', item: `${SITE_URL}/parts` },
              { '@type': 'ListItem', position: 3, name: 'Lithium Batteries', item: `${SITE_URL}/lithium-batteries` },
              { '@type': 'ListItem', position: 4, name: cart.fullName, item: `${SITE_URL}/lithium-batteries/${cart.slug}` },
            ],
          }),
        }}
      />

      <Script
        id={`cart-faq-ld-${cart.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: cart.faq.map(({ q, a }) => ({
              '@type': 'Question',
              name: q,
              acceptedAnswer: { '@type': 'Answer', text: a },
            })),
          }),
        }}
      />

      {/* ─────────── Breadcrumb (visible) ─────────── */}
      <nav className="text-sm text-slate-500 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-orange-600">Home</Link>
        <span>/</span>
        <Link href="/parts" className="hover:text-orange-600">Parts</Link>
        <span>/</span>
        <Link href="/lithium-batteries" className="hover:text-orange-600">Lithium Batteries</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{cart.fullName}</span>
      </nav>

      {/* ─────────── Hero ─────────── */}
      <header className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded uppercase">
            {cart.brand}
          </span>
          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded">
            {cart.voltage}
          </span>
          <span className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded">
            {cart.yearRange}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
          {cart.fullName} Lithium Battery Conversion
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl">
          Drop-in LiFePO4 upgrade for the {cart.fullName} ({cart.yearRange}). Get{' '}
          {cart.rangeEstimate}, lose 200+ lb of dead lead-acid weight, and forget about battery maintenance for the next decade.
        </p>
      </header>

      {/* ─────────── Cart-specific intro ─────────── */}
      <section className="bg-slate-50 rounded-2xl p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-3">
          Why lithium fits the {cart.model}
        </h2>
        <p className="text-slate-700 leading-relaxed">{cart.cartIntro}</p>
      </section>

      {/* ─────────── Recommended kit (primary) ─────────── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">
          Recommended Conversion Kit
        </h2>
        <RecommendedCard battery={primary} badge="BEST FIT" badgeColor="bg-orange-500" />
      </section>

      {/* ─────────── Alternative options ─────────── */}
      {(budget || extended) && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Alternative Options</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {budget && (
              <RecommendedCard
                battery={budget}
                badge="ENTRY PRICE"
                badgeColor="bg-blue-500"
                subtitle="Lower upfront cost. Good for moderate use, shorter range needs."
              />
            )}
            {extended && (
              <RecommendedCard
                battery={extended}
                badge="EXTENDED RANGE"
                badgeColor="bg-purple-500"
                subtitle="Higher capacity for longer range, hilly terrain, or fleet duty cycles."
              />
            )}
          </div>
        </section>
      )}

      {/* ─────────── Install notes ─────────── */}
      <section className="bg-white border border-slate-200 rounded-2xl p-8 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Wrench className="w-6 h-6 text-orange-600" />
          {cart.fullName} Install Notes
        </h2>
        <ul className="space-y-3">
          {cart.installNotes.map((note, idx) => (
            <li key={idx} className="flex gap-3 text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{note}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-slate-500 pt-2 border-t border-slate-100">
          Most {cart.brand} {cart.model} installs take 2–4 hours with basic hand tools. Step-by-step
          instructions and a video walkthrough are included with every kit. Prefer professional
          install? Most golf cart shops complete the swap for $100–$200.
        </p>
      </section>

      {/* ─────────── Trust badges ─────────── */}
      <section className="grid md:grid-cols-4 gap-4">
        {[
          { icon: Award, label: '8-Year Warranty', sub: '6 yr full + 2 yr pro-rated' },
          { icon: Battery, label: '6,000+ Cycles', sub: 'IP65 weatherproof' },
          { icon: Truck, label: 'HazMat Ground Ship', sub: 'Free on 3+ batteries' },
          { icon: Zap, label: 'Bluetooth + BMS', sub: 'Anti-theft lockout' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <Icon className="w-6 h-6 mx-auto text-orange-600 mb-2" />
            <p className="font-semibold text-sm text-slate-900">{label}</p>
            <p className="text-xs text-slate-500 mt-1">{sub}</p>
          </div>
        ))}
      </section>

      {/* ─────────── Cart-specific FAQ ─────────── */}
      <section className="max-w-3xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 text-center">
          {cart.fullName} Lithium Conversion FAQ
        </h2>
        {cart.faq.map(({ q, a }) => (
          <details key={q} className="bg-white border border-slate-200 rounded-lg p-4 group">
            <summary className="font-semibold text-slate-900 cursor-pointer list-none flex justify-between items-center">
              {q}
              <span className="text-orange-500 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">{a}</p>
          </details>
        ))}
      </section>

      {/* ─────────── Related learning content ─────────── */}
      <section className="bg-slate-50 rounded-2xl p-8 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Learn More Before You Buy</h2>
        <p className="text-slate-700">
          Not sure if lithium is right for your {cart.model}? Read our complete buyer's guide
          covering 10-year cost-of-ownership math, range calculations, and cold-weather behavior.
        </p>
        <Link
          href="/insights/lithium-vs-lead-acid-golf-cart-batteries-2026-guide"
          className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700"
        >
          Lithium vs Lead-Acid Golf Cart Batteries: 2026 Buyer's Guide →
        </Link>
      </section>

      {/* ─────────── Browse other carts ─────────── */}
      <section className="border-t border-slate-200 pt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Lithium Conversions for Other Carts</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {otherCarts.map((c) => (
            <Link
              key={c.slug}
              href={`/lithium-batteries/${c.slug}`}
              className="bg-white border border-slate-200 hover:border-orange-300 hover:shadow-sm rounded-lg px-4 py-3 transition-all"
            >
              <p className="font-semibold text-slate-900 text-sm">{c.fullName}</p>
              <p className="text-xs text-slate-500 mt-1">{c.yearRange} · {c.voltage}</p>
            </Link>
          ))}
        </div>
        <Link
          href="/lithium-batteries"
          className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700 mt-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to all Lithium Batteries
        </Link>
      </section>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recommended product card
// ─────────────────────────────────────────────────────────────────────────────
function RecommendedCard({
  battery,
  badge,
  badgeColor,
  subtitle,
}: {
  battery: BatteryRow;
  badge: string;
  badgeColor: string;
  subtitle?: string;
}) {
  return (
    <Link
      href={`/parts/${battery.slug}`}
      className="group bg-white border-2 border-slate-200 hover:border-orange-300 hover:shadow-lg rounded-xl p-6 transition-all flex flex-col md:flex-row gap-6"
    >
      <div className="relative aspect-square bg-slate-50 rounded-lg overflow-hidden md:w-56 md:h-56 flex-shrink-0">
        {battery.image_url && (
          <Image
            src={battery.image_url}
            alt={battery.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform"
          />
        )}
        <span className={`absolute top-3 left-3 ${badgeColor} text-white text-xs font-bold px-2 py-1 rounded`}>
          {badge}
        </span>
      </div>

      <div className="flex-1 space-y-3">
        <div>
          <p className="text-xs text-slate-500 mb-1">SKU: {battery.sku}</p>
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 leading-tight">
            {battery.name}
          </h3>
          {subtitle && <p className="text-sm text-slate-600 mt-2">{subtitle}</p>}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-orange-600">
            ${battery.price.toLocaleString()}
          </span>
          {battery.weight_lbs && (
            <span className="text-sm text-slate-500">· {battery.weight_lbs} lb</span>
          )}
        </div>

        {battery.metadata?.product_type === 'kit' && (
          <ul className="text-sm text-slate-600 space-y-1">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> Lithium Rhino battery
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> LiFePO4-rated fast charger
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> DC-to-DC voltage converter
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> LCD touchscreen display
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> Mounting hardware
            </li>
          </ul>
        )}

        <div className="pt-2">
          <span className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold group-hover:bg-orange-700 transition-colors">
            View Product & Buy →
          </span>
        </div>
      </div>
    </Link>
  );
}
