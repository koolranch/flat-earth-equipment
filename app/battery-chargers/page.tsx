import { Metadata } from "next";
import { supabaseServer } from "@/lib/supabaseServer";
import ChargerFAQ from "@/components/ChargerFAQ";
import ChargerCard from "@/components/ChargerCard";
import { type BatteryCharger, parseChargerSpecs } from "@/lib/batteryChargers";
import ChargerSelectorWithRecommendations from "./ChargerSelectorWithRecommendations";
import { filterGreen } from "@/lib/greenFilter";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const title = "Forklift Battery Chargers 24V-80V | Fast Ship Available";
  const description = "Professional forklift battery chargers for 24V, 36V, 48V & 80V batteries. Fast charging, single/three-phase options. Expert support & same-day shipping.";
  
  return {
    title,
    description,
    alternates: { canonical: "/battery-chargers" },
    openGraph: { 
      title: "Professional Forklift Battery Chargers - All Voltages Available", 
      description, 
      type: "website",
      url: "https://www.flatearthequipment.com/battery-chargers"
    },
    twitter: { 
      card: "summary_large_image", 
      title, 
      description 
    },
    robots: {
      index: true,
      follow: true,
    },
    keywords: "forklift charger, 48v forklift charger, 36v forklift charger, 24v forklift charger, 80v forklift charger, industrial battery charger, fast charging, three phase charger, single phase charger"
  };
}

async function fetchParts(): Promise<BatteryCharger[]> {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("parts")
    .select(`
      id,
      name,
      slug,
      brand,
      description,
      image_url,
      price,
      price_cents,
      sku,
      category_slug,
      stripe_price_id,
      has_core_charge,
      core_charge
    `)
    .eq("category_slug", "battery-chargers")
    .order("slug", { ascending: true })
    .limit(1000);
    
  if (error) {
    console.error("Error fetching chargers:", error);
    return [];
  }
  return data ?? [];
}

function ssrFilter(parts: BatteryCharger[], searchParams: Record<string, string | undefined>) {
  const q = (searchParams.q || "").toLowerCase();
  const family = (searchParams.family || "").toLowerCase();
  const v = searchParams.v ? Number(searchParams.v) : undefined;
  const a = searchParams.a ? Number(searchParams.a) : undefined;
  const phase = searchParams.phase || ""; // "1P" | "3P"
  
  return parts.filter((p) => {
    const specs = parseChargerSpecs(p);
    
    // Text search across name, sku, description
    if (q && !(
      p.name?.toLowerCase().includes(q) || 
      p.sku?.toLowerCase().includes(q) || 
      p.description?.toLowerCase().includes(q)
    )) {
      return false;
    }
    
    // Family filter (green2, green4, etc.)
    if (family && !p.slug.toLowerCase().includes(family)) {
      return false;
    }
    
    // Voltage filter
    if (v && specs.voltage !== v) {
      return false;
    }
    
    // Current (amperage) filter
    if (a && specs.current !== a) {
      return false;
    }
    
    // Phase filter
    if (phase && specs.phase !== phase) {
      return false;
    }
    
    return true;
  });
}

function itemListJsonLd(items: { name: string; slug: string }[]) {
  const list = items.slice(0, 50); // Limit for performance
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": list.map((it, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "url": `https://www.flatearthequipment.com/chargers/${it.slug}`,
      "name": it.name
    }))
  };
}

function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I choose the right forklift battery charger?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Match your battery voltage exactly (24V/36V/48V/80V), calculate required amperage based on your charging window, and confirm your facility's power input (single-phase 208–240V or three-phase 480V/600V). Consider your forklift brand compatibility and battery chemistry type."
        }
      },
      {
        "@type": "Question",
        "name": "What amperage forklift charger do I need?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Use this formula for lead-acid batteries: charge time ≈ (battery Ah ÷ charger A) × 1.2. Example: 750Ah battery with a 75A charger takes ~12 hours. For faster charging, choose higher amperage but ensure proper ventilation and electrical capacity."
        }
      },
      {
        "@type": "Question",
        "name": "What's the difference between 24V, 36V, 48V and 80V forklift chargers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "24V chargers are for small pallet jacks and light-duty forklifts. 36V suits medium warehouse forklifts. 48V is most common for industrial applications. 80V is for heavy-duty, high-capacity forklifts. Always match your battery voltage exactly."
        }
      },
      {
        "@type": "Question",
        "name": "How long does it take to charge a forklift battery?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Standard overnight charging takes 8-12 hours with conventional chargers. Fast charging reduces this to 4-6 hours but requires higher amperage chargers and proper battery cooling. Charging time depends on battery capacity and charger output."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use a single-phase forklift charger instead of three-phase?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, if your facility doesn't have 3-phase power, choose a single-phase model (208–240V input). Three-phase chargers are more efficient for higher amperage applications but require industrial electrical infrastructure."
        }
      },
      {
        "@type": "Question",
        "name": "How do I troubleshoot a forklift charger that's not working?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Check power connections, verify correct voltage settings, inspect fuses/breakers, and ensure proper ventilation. Common issues include loose connections, incorrect voltage selection, or thermal shutoff activation. Contact our technical support for detailed troubleshooting."
        }
      }
    ]
  };
}

export default async function Page({ 
  searchParams 
}: { 
  searchParams: Record<string, string | undefined> 
}) {
  const allPartsRaw = await fetchParts();
  // Apply GREEN-only filter to restrict to FSIP GREEN Series (GREEN2/4/6/8/X)
  const allParts = filterGreen(allPartsRaw);
  const filteredParts = ssrFilter(allParts, searchParams);
  
  const jsonLdList = itemListJsonLd(filteredParts.map(p => ({ name: p.name, slug: p.slug })));
  const jsonLdFaq = faqJsonLd();
  
  // Check if this is a bot/crawler by looking for filters - if no client-side JS filters, show SSR results
  const hasFilters = Object.keys(searchParams).some(key => 
    ['q', 'family', 'v', 'a', 'phase'].includes(key) && searchParams[key]
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* JSON-LD Structured Data */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdList) }} 
      />
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} 
      />

      {/* SEO-Optimized Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Professional Forklift Battery Chargers
              <span className="block text-blue-200">24V • 36V • 48V • 80V</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-xl text-blue-100">
              Industrial-grade forklift chargers for Crown, Toyota, Yale, Hyster & all major brands. 
              Fast charging and overnight options with single or three-phase power input.
            </p>
            <p className="mt-2 text-blue-200/80 text-sm">
              FSIP GREEN Series • Professional Installation • Expert Technical Support
            </p>
            <div className="mt-8 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
              <div className="flex items-center gap-4 text-sm text-blue-200">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Same-Day Shipping
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  Expert Support
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  All Forklift Brands
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Interactive Selector with Smart Recommendations */}
        <ChargerSelectorWithRecommendations 
          chargers={allParts}
          initialFilters={{
            voltage: searchParams.v ? Number(searchParams.v) : null, 
            amps: searchParams.a ? Number(searchParams.a) : null, 
            phase: (searchParams.phase as '1P' | '3P') ?? null,
            chemistry: null,
            limit: 6
          }}
          fallbackItems={filteredParts}
        />

        {/* SSR Results for SEO (when filters are applied via URL) */}
        {hasFilters && (
          <div className="mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">
                Search Results
              </h2>
              <p className="text-neutral-600 mt-1">
                {filteredParts.length} charger{filteredParts.length !== 1 ? "s" : ""} match your criteria
              </p>
            </div>

            {filteredParts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.469-.742-6.21-2.002M6 9.5L5.5 9l-.5-.5L6 9.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  No chargers match your criteria
                </h3>
                <p className="text-neutral-600 mb-4">
                  Try adjusting your filters or browse all available chargers
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredParts.map((charger) => (
                  <ChargerCard
                    key={charger.id}
                    charger={charger}
                    onQuoteClick={() => {}} // Server-side rendering - no interaction
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Voltage-Specific Sections for SEO */}
        <div className="mt-16 space-y-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Forklift Battery Chargers by Voltage
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Choose the right charger for your forklift battery voltage. Each voltage requires specific amperage and power input configurations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 24V Chargers */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">24V</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">24V Forklift Chargers</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Ideal for small electric forklifts and pallet jacks. Available in 15A-50A output with single-phase input.
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div>• Typical: 15A-35A output</div>
                  <div>• Input: 110V-240V single-phase</div>
                  <div>• Applications: Small warehouse forklifts</div>
                </div>
              </div>
            </div>

            {/* 36V Chargers */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-600">36V</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">36V Forklift Chargers</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Popular for medium-duty electric forklifts. Available in 20A-75A output with single-phase input.
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div>• Typical: 25A-75A output</div>
                  <div>• Input: 208V-240V single-phase</div>
                  <div>• Applications: Mid-size warehouse forklifts</div>
                </div>
              </div>
            </div>

            {/* 48V Chargers */}
            <div className="bg-white rounded-2xl border border-orange-200 p-6 hover:shadow-lg transition-shadow ring-2 ring-orange-100">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-orange-600">48V</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">48V Forklift Chargers</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Most common voltage for industrial forklifts. Available in 25A-200A with single or three-phase input.
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div>• Typical: 50A-150A output</div>
                  <div>• Input: 208V-600V single/three-phase</div>
                  <div>• Applications: Most industrial forklifts</div>
                </div>
                <div className="mt-3">
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              </div>
            </div>

            {/* 80V Chargers */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-600">80V</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">80V Forklift Chargers</h3>
                <p className="text-gray-600 text-sm mb-4">
                  High-capacity chargers for large industrial forklifts. Available in 50A-150A with three-phase input.
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div>• Typical: 75A-150A output</div>
                  <div>• Input: 480V-600V three-phase</div>
                  <div>• Applications: Heavy-duty forklifts</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <ChargerFAQ />
      </div>

      {/* SEO-Enhanced Benefits Section */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900">
              Why Choose Our Industrial Forklift Battery Chargers?
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              Professional-grade chargers for Crown, Toyota, Yale, Hyster and all major forklift brands
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Fast Charging Technology</h3>
              <p className="text-neutral-600 text-sm">
                Advanced charging profiles reduce forklift downtime from 12 hours to 4-6 hours, maximizing fleet productivity
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Industrial Reliability</h3>
              <p className="text-neutral-600 text-sm">
                Built for 24/7 warehouse operation with advanced safety features, thermal monitoring, and automatic shutoff protection
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Energy Efficient</h3>
              <p className="text-neutral-600 text-sm">
                High-efficiency designs reduce electricity costs by up to 20% compared to older charger models
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5zM8.25 12l7.5 0" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Expert Technical Support</h3>
              <p className="text-neutral-600 text-sm">
                Professional installation assistance, troubleshooting support, and forklift charger maintenance guidance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}