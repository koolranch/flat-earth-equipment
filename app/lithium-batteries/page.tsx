import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';
import { Battery, ShieldCheck, Truck, Wrench, Zap, Snowflake, Cpu, Award } from 'lucide-react';
import { generatePageAlternates } from '@/app/seo-defaults';
import { CART_MODELS } from '@/constants/golfCartModels';

export const dynamic = 'force-static';
export const revalidate = 3600;

const LITHIUM_OG_IMAGE = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products/lithium-rhino.png';

export const metadata = {
  title: 'Lithium Golf Cart Batteries | Lithium Rhino LiFePO4 Conversion Kits | 36V 48V 72V',
  description:
    'In-stock Lithium Rhino LiFePO4 golf cart battery conversion kits and replacement batteries for EZGO, Club Car, Yamaha. 6,000+ cycles, 8-year warranty, IP65, Bluetooth. Free shipping on 3+.',
  keywords:
    'lithium golf cart battery, lithium rhino, LiFePO4 golf cart battery, 48V 105Ah lithium, 36V 105Ah lithium, EZGO lithium conversion, Club Car lithium conversion, Yamaha lithium conversion, golf cart battery upgrade, heated lithium battery',
  alternates: generatePageAlternates('/lithium-batteries'),
  openGraph: {
    title: 'Lithium Golf Cart Batteries | Lithium Rhino LiFePO4',
    description:
      'In-stock Lithium Rhino LiFePO4 golf cart battery conversion kits and replacement batteries. 6,000+ cycles, 8-year warranty, free shipping on 3+ batteries.',
    type: 'website',
    url: 'https://www.flatearthequipment.com/lithium-batteries',
    images: [{ url: LITHIUM_OG_IMAGE, width: 1200, height: 1200, alt: 'Lithium Rhino LiFePO4 Golf Cart Battery' }],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Lithium Golf Cart Batteries | Lithium Rhino LiFePO4',
    description:
      'In-stock conversion kits and replacement batteries for EZGO, Club Car, Yamaha. 6,000+ cycles, 8-year warranty, free shipping on 3+.',
    images: [LITHIUM_OG_IMAGE],
  },
};

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
};

async function getBatteries() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('parts')
    .select('id, name, slug, sku, price, image_url, weight_lbs, metadata')
    .eq('category', 'Lithium Batteries')
    .eq('is_in_stock', true)
    .order('price', { ascending: true });
  return (data || []) as BatteryRow[];
}

const FAQ_ITEMS: Array<{ q: string; a: string }> = [
  {
    q: 'Will a Lithium Rhino battery fit my golf cart?',
    a: 'Lithium Rhino batteries are drop-in replacements for EZGO TXT/RXV, Club Car DS/Precedent/Tempo, and Yamaha Drive/Drive2 carts. Match the voltage of your existing pack (36V or 48V), then choose the capacity (Ah) based on your range needs. The 48V 105Ah is the most popular for modern carts.',
  },
  {
    q: 'Conversion Kit vs Replacement Battery — which do I need?',
    a: 'Choose a Conversion Kit if this is your first lithium upgrade — it includes the battery, charger, DC converter, LCD display, and mounting hardware. Choose a Replacement Battery only if you already have a Lithium Rhino install and just need to swap the battery itself.',
  },
  {
    q: 'How long does it take to install?',
    a: 'Most DIY installations take 2-4 hours. The kit includes mounting hardware and instructions. If you prefer professional installation, most golf cart shops can complete the swap in under 2 hours.',
  },
  {
    q: 'What is HazMat shipping and how does it affect my order?',
    a: 'Lithium batteries ship as Class 9 hazardous materials (UN3480) by ground freight only. We use certified HazMat carriers and include all required placards. Single-battery freight ranges from $99-$349 by weight. Orders of 3 or more batteries ship free.',
  },
  {
    q: 'How does the 8-year warranty work?',
    a: 'The first 6 years are full replacement coverage. Years 7-8 are pro-rated with a $500 deductible. Warranty claims are handled directly through us — no need to deal with the manufacturer.',
  },
  {
    q: 'Can I use my existing lead-acid charger?',
    a: 'No. Lead-acid chargers will damage a lithium pack. Conversion Kits include the correct LiFePO4-compatible charger. If you buy a Replacement Battery only, make sure your existing charger is lithium-rated.',
  },
];

function voltageOf(b: BatteryRow): string {
  return b.metadata?.voltage || '48V';
}

function productTypeOf(b: BatteryRow): 'kit' | 'battery' {
  return b.metadata?.product_type === 'battery' ? 'battery' : 'kit';
}

export default async function LithiumBatteriesLanding() {
  const batteries = await getBatteries();
  const kits = batteries.filter(b => productTypeOf(b) === 'kit');
  const replacements = batteries.filter(b => productTypeOf(b) === 'battery');

  // Group kits by voltage
  const kitsByVoltage: Record<string, BatteryRow[]> = {};
  for (const k of kits) {
    const v = voltageOf(k);
    if (!kitsByVoltage[v]) kitsByVoltage[v] = [];
    kitsByVoltage[v].push(k);
  }

  return (
    <main className="container mx-auto px-4 lg:px-8 py-12 space-y-16 pb-20">
      {/* ItemList schema — for search results showing the product collection */}
      <script
        id="lithium-batteries-itemlist-ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Lithium Golf Cart Batteries',
            description:
              'In-stock Lithium Rhino LiFePO4 golf cart battery conversion kits and replacement batteries for EZGO, Club Car, and Yamaha.',
            url: 'https://www.flatearthequipment.com/lithium-batteries',
            numberOfItems: batteries.length,
            itemListElement: batteries.map((b, idx) => ({
              '@type': 'ListItem',
              position: idx + 1,
              item: {
                '@type': 'Product',
                sku: b.sku,
                name: b.name,
                brand: { '@type': 'Brand', name: 'Lithium Rhino' },
                image: b.image_url || undefined,
                offers: {
                  '@type': 'Offer',
                  price: b.price.toFixed(2),
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
                  url: `https://www.flatearthequipment.com/parts/${b.slug}`,
                },
              },
            })),
          }),
        }}
      />

      {/* BreadcrumbList schema */}
      <script
        id="lithium-batteries-breadcrumb-ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.flatearthequipment.com' },
              { '@type': 'ListItem', position: 2, name: 'Parts', item: 'https://www.flatearthequipment.com/parts' },
              { '@type': 'ListItem', position: 3, name: 'Lithium Batteries', item: 'https://www.flatearthequipment.com/lithium-batteries' },
            ],
          }),
        }}
      />

      {/* FAQPage schema — drives "People Also Ask" rich results */}
      <script
        id="lithium-batteries-faq-ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
              '@type': 'Question',
              name: q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: a,
              },
            })),
          }),
        }}
      />

      {/* ─────────── HERO ─────────── */}
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
          Lithium Golf Cart Batteries — Lithium Rhino LiFePO4
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          In-stock LiFePO4 conversion kits and replacement batteries for EZGO, Club Car, and Yamaha.
          50% more range, 60% less weight, 12+ year lifespan — backed by an industry-leading 8-year warranty.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
            ✓ 6,000+ Charge Cycles
          </span>
          <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
            ✓ 8-Year Warranty
          </span>
          <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full font-medium">
            ✓ IP65 Weatherproof
          </span>
          <span className="bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full font-medium">
            ✓ Free Shipping on 3+ Batteries
          </span>
        </div>
      </header>

      {/* ─────────── WHY LITHIUM ─────────── */}
      <section className="bg-slate-50 rounded-2xl p-8 md:p-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Why Convert to Lithium?</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Zap, title: '50% More Range', desc: 'Same voltage, more usable capacity. Get 40-50 miles per charge instead of 20-25.' },
            { icon: Battery, title: '60% Lighter', desc: 'A 48V LiFePO4 pack weighs ~100 lb vs. ~340 lb for lead-acid — better acceleration, less wear.' },
            { icon: Wrench, title: 'Zero Maintenance', desc: 'No watering, no terminal cleaning, no equalization charges. Install once and forget it.' },
            { icon: Award, title: '12+ Year Lifespan', desc: '6,000+ cycles vs. 500-1,000 for flooded lead-acid. Pays for itself in 2-3 years.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                <Icon className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── CONVERSION KITS BY VOLTAGE ─────────── */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Conversion Kits</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Complete drop-in bundles include the Lithium Rhino battery, fast charger, DC-to-DC converter,
            LCD touchscreen display, and all mounting hardware. Install in a single afternoon.
          </p>
        </div>

        {(['36V', '48V', '72V'] as const).map(v => {
          const list = kitsByVoltage[v] || [];
          if (list.length === 0) return null;
          return (
            <div key={v}>
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <span className="bg-orange-500 text-white text-sm px-3 py-1 rounded">{v}</span>
                {v === '36V' && 'For older EZGO TXT, Club Car DS, Yamaha G14/G16'}
                {v === '48V' && 'For modern EZGO TXT/RXV, Club Car Precedent/Tempo, Yamaha Drive/Drive2'}
                {v === '72V' && 'High-performance carts and commercial fleet'}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {list.map(b => (
                  <ProductCard key={b.id} battery={b} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* ─────────── BROWSE BY CART MODEL ─────────── */}
      <section className="bg-orange-50 border border-orange-200 rounded-2xl p-8 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Find the Right Kit for Your Cart</h2>
          <p className="text-slate-700 max-w-2xl mx-auto">
            Cart-specific install notes, recommended SKUs, and FAQs for the most popular models.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {CART_MODELS.sort((a, b) => {
            const order: Record<string, number> = { High: 0, Medium: 1, Niche: 2 };
            return order[a.popularity] - order[b.popularity];
          }).map((cart) => (
            <Link
              key={cart.slug}
              href={`/lithium-batteries/${cart.slug}`}
              className="bg-white border border-slate-200 hover:border-orange-300 hover:shadow-md rounded-lg px-4 py-3 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{cart.fullName}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {cart.yearRange} · {cart.voltage}
                  </p>
                </div>
                <span className="text-orange-500 text-xl">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─────────── REPLACEMENT BATTERIES ─────────── */}
      {replacements.length > 0 && (
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Replacement Batteries</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Already have a Lithium Rhino kit installed? Save by replacing just the battery.
              Includes the heated all-weather variant for cold-climate use.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {replacements.map(b => (
              <ProductCard key={b.id} battery={b} />
            ))}
          </div>
        </section>
      )}

      {/* ─────────── KEY DIFFERENTIATORS ─────────── */}
      <section className="bg-slate-900 text-white rounded-2xl p-8 md:p-12">
        <h2 className="text-2xl font-bold mb-8 text-center">What Makes Lithium Rhino Different</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Award, title: '8-Year Warranty', desc: '6 years complete coverage + 2 years pro-rated. The longest warranty in the lithium golf cart battery market. Most competitors offer 5 years.' },
            { icon: Snowflake, title: 'Heated Variant Available', desc: 'The 48V 120Ah Heated battery has a built-in low-temp heating element — operates down to -4°F without capacity loss. Critical for northern climates.' },
            { icon: Cpu, title: 'Bluetooth + Anti-Theft', desc: 'Built-in BMS with Bluetooth app monitoring (state of charge, cell health, history). Anti-theft lockout deters cart theft.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="space-y-3">
              <Icon className="w-8 h-8 text-orange-400" />
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-slate-300">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── Cross-promotion to Forklift Charger Modules ─────────── */}
      <section className="bg-blue-50 rounded-2xl p-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-blue-600/10 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
          Also Available
        </div>
        <h2 className="text-2xl font-bold text-blue-900">
          Need a Forklift Charger Module?
        </h2>
        <p className="text-blue-800 max-w-2xl mx-auto">
          We also stock remanufactured forklift charger modules for Enersys, Hawker, and ACT Quantum.
          Reman exchange or send-in repair options, both backed by a 6-month warranty.
        </p>
        <Link
          href="/charger-modules"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Browse Charger Modules →
        </Link>
      </section>

      {/* ─────────── SHIPPING / TRUST ─────────── */}
      <section className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
          <Truck className="w-8 h-8 mx-auto text-orange-500 mb-3" />
          <h3 className="font-semibold text-slate-900 mb-1">HazMat Ground Shipping</h3>
          <p className="text-sm text-slate-600">Class 9 / UN3480 certified ground freight to all 48 states.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
          <ShieldCheck className="w-8 h-8 mx-auto text-orange-500 mb-3" />
          <h3 className="font-semibold text-slate-900 mb-1">8-Year Warranty</h3>
          <p className="text-sm text-slate-600">Manufacturer-backed 8-year warranty handled directly through us.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
          <Battery className="w-8 h-8 mx-auto text-orange-500 mb-3" />
          <h3 className="font-semibold text-slate-900 mb-1">Fleet Discount</h3>
          <p className="text-sm text-slate-600"><strong>Free shipping</strong> on orders of 3 or more batteries.</p>
        </div>
      </section>

      {/* ─────────── FAQ (rendered + schema-backed via FAQ_ITEMS) ─────────── */}
      <section className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQ_ITEMS.map(({ q, a }) => (
            <details key={q} className="bg-white border border-slate-200 rounded-lg p-4 group">
              <summary className="font-semibold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                {q}
                <span className="text-orange-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-slate-600 text-sm mt-3 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Product Card
// ─────────────────────────────────────────────────────────────────────────────
function ProductCard({ battery }: { battery: BatteryRow }) {
  const variant = battery.metadata?.variant;
  const variantBadge =
    variant === 'heated' ? { label: 'HEATED', color: 'bg-blue-500' }
    : variant === 'cube' ? { label: 'CUBE', color: 'bg-purple-500' }
    : variant === 'goliath' ? { label: 'GOLIATH', color: 'bg-red-500' }
    : null;
  return (
    <Link
      href={`/parts/${battery.slug}`}
      className="group bg-white rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all overflow-hidden"
    >
      <div className="relative aspect-square bg-slate-50">
        {battery.image_url && (
          <Image
            src={battery.image_url}
            alt={battery.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform"
          />
        )}
        {variantBadge && (
          <span className={`absolute top-3 left-3 ${variantBadge.color} text-white text-xs font-bold px-2 py-1 rounded`}>
            {variantBadge.label}
          </span>
        )}
        <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
          IN STOCK
        </span>
      </div>
      <div className="p-4 space-y-2">
        <h4 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-orange-600">
          {battery.name}
        </h4>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-orange-600">${battery.price.toLocaleString()}</span>
          {battery.weight_lbs && (
            <span className="text-xs text-slate-500">{battery.weight_lbs} lb</span>
          )}
        </div>
        <p className="text-xs text-slate-500">SKU: {battery.sku}</p>
      </div>
    </Link>
  );
}
