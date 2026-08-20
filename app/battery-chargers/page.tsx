import { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import ChargerFAQ from "@/components/ChargerFAQ";
import ChargerCard from "@/components/ChargerCard";
import {
  type BatteryCharger,
  getChargerDetailHref,
  parseChargerSpecs,
} from "@/lib/batteryChargers";
import ChargerSelectorWithRecommendations from "./ChargerSelectorWithRecommendations";
import { filterGreen } from "@/lib/greenFilter";

const FEATURED_VOLTAGE_ORDER = [48, 36, 24, 80] as const;

/** Round-robin featured chargers across voltages so the hub shows shoppable SKUs immediately. */
function pickFeaturedChargers(parts: BatteryCharger[], limit = 12): BatteryCharger[] {
  const pools = FEATURED_VOLTAGE_ORDER.map((voltage) =>
    parts.filter((p) => parseChargerSpecs(p).voltage === voltage)
  );
  const picked: BatteryCharger[] = [];
  let index = 0;
  while (picked.length < limit) {
    let added = false;
    for (const pool of pools) {
      if (pool[index]) {
        picked.push(pool[index]);
        added = true;
        if (picked.length >= limit) break;
      }
    }
    if (!added) break;
    index += 1;
  }
  return picked;
}

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const title = "Forklift Battery Chargers 24V-80V | Fast Ship Available";
  const description = "Professional forklift battery chargers 24V-80V. All major brands supported. Fast shipping, precision-fit parts, and expert technical support for your fleet.";
  
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
    "name": "Forklift Battery Chargers",
    "description": "Professional forklift battery chargers for 24V, 36V, 48V, and 80V batteries",
    "itemListElement": list.map((it, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "url": `https://www.flatearthequipment.com${getChargerDetailHref(it.slug)}`,
      "name": it.name
    }))
  };
}

function productSchemaJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "FSIP GREEN Series Forklift Battery Chargers",
    "description": "Professional industrial forklift battery chargers available in 24V, 36V, 48V, and 80V configurations with fast charging and overnight charging options",
    "brand": {
      "@type": "Brand",
      "name": "FSIP"
    },
    "category": "Industrial Battery Chargers",
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "1100",
      "highPrice": "3700",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Flat Earth Equipment"
      }
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Voltage Options",
        "value": "24V, 36V, 48V, 80V"
      },
      {
        "@type": "PropertyValue", 
        "name": "Charging Types",
        "value": "Fast Charging, Overnight Charging"
      },
      {
        "@type": "PropertyValue",
        "name": "Power Input",
        "value": "Single-phase, Three-phase"
      },
      {
        "@type": "PropertyValue",
        "name": "Compatible Brands",
        "value": "Crown, Toyota, Yale, Hyster, Caterpillar"
      }
    ]
  };
}

function howToSchemaJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Choose a Forklift Battery Charger",
    "description": "Step-by-step guide to selecting the right forklift battery charger based on voltage, amperage, and power requirements",
    "image": "https://www.flatearthequipment.com/images/insights/forklift-charger-guide.jpg",
    "totalTime": "PT15M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "1100-3700"
    },
    "tool": [
      {
        "@type": "HowToTool",
        "name": "Forklift Battery Voltage Information"
      },
      {
        "@type": "HowToTool", 
        "name": "Facility Electrical Specifications"
      }
    ],
    "step": [
      {
        "@type": "HowToStep",
        "name": "Determine Battery Voltage",
        "text": "Check your forklift battery label to find the voltage (24V, 36V, 48V, or 80V). This must match your charger exactly.",
        "url": "https://www.flatearthequipment.com/battery-chargers#voltage-selection"
      },
      {
        "@type": "HowToStep",
        "name": "Calculate Required Amperage", 
        "text": "Determine charging amperage based on battery capacity and desired charging time. Use C/10 rate for overnight charging or C/5 for fast charging.",
        "url": "https://www.flatearthequipment.com/battery-chargers#amperage-calculation"
      },
      {
        "@type": "HowToStep",
        "name": "Verify Power Input Requirements",
        "text": "Confirm your facility has appropriate power input (single-phase 208-240V or three-phase 480-600V) for your selected charger.",
        "url": "https://www.flatearthequipment.com/battery-chargers#power-input"
      }
    ]
  };
}

function breadcrumbSchemaJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.flatearthequipment.com"
      },
      {
        "@type": "ListItem", 
        "position": 2,
        "name": "Parts",
        "item": "https://www.flatearthequipment.com/parts"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Forklift Battery Chargers",
        "item": "https://www.flatearthequipment.com/battery-chargers"
      }
    ]
  };
}

function organizationSchemaJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Flat Earth Equipment",
    "url": "https://www.flatearthequipment.com",
    "logo": "https://www.flatearthequipment.com/images/flat-earth-logo.png",
    "description": "Professional forklift parts, battery chargers, and equipment rentals with expert technical support and same-day shipping.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US",
      "addressRegion": "Western United States"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-800-XXX-XXXX",
      "contactType": "Customer Service",
      "availableLanguage": ["English", "Spanish"]
    },
    "sameAs": [
      "https://www.facebook.com/flatearthequipment",
      "https://www.linkedin.com/company/flat-earth-equipment"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Forklift Battery Chargers",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "24V Forklift Battery Chargers"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Product",
            "name": "36V Forklift Battery Chargers"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product", 
            "name": "48V Forklift Battery Chargers"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "80V Forklift Battery Chargers"
          }
        }
      ]
    }
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
  const jsonLdProduct = productSchemaJsonLd();
  const jsonLdHowTo = howToSchemaJsonLd();
  const jsonLdBreadcrumb = breadcrumbSchemaJsonLd();
  const jsonLdOrganization = organizationSchemaJsonLd();
  
  const hasFilters = Object.keys(searchParams).some(key => 
    ['q', 'family', 'v', 'a', 'phase'].includes(key) && searchParams[key]
  );
  const catalogParts = hasFilters ? filteredParts : pickFeaturedChargers(allParts, 12);
  const voltageLabel = searchParams.v ? `${searchParams.v}V` : null;

  return (
    <div id="top" className="min-h-screen bg-neutral-50">
      {/* JSON-LD Structured Data */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdList) }} 
      />
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} 
      />
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }} 
      />
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHowTo) }} 
      />
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} 
      />
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }} 
      />

      {/* Breadcrumb Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <a href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
                  Home
                </a>
              </li>
              <li className="flex items-center">
                <svg className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <a href="/parts" className="text-gray-500 hover:text-gray-700 transition-colors">
                  Parts
                </a>
              </li>
              <li className="flex items-center">
                <svg className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-900 font-medium">Forklift Battery Chargers</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* SEO-Optimized Hero Section — slate band, canyon-rust accents (not bright blue) */}
      <div className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-canyon-rust">
              Industrial battery chargers
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-5xl">
              Professional Forklift Battery Chargers
              <span className="mt-2 block text-2xl font-semibold text-slate-300 sm:text-3xl">24V · 36V · 48V · 80V</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-300">
              Industrial-grade forklift chargers for Crown, Toyota, Yale, Hyster &amp; all major brands.
              {' '}
              <a href="/insights/fast-vs-overnight-forklift-charging" className="text-canyon-rust hover:text-orange-300 underline underline-offset-2">Fast charging and overnight options</a>
              {' '}with{' '}
              <a href="/insights/forklift-charger-voltage-comparison" className="text-canyon-rust hover:text-orange-300 underline underline-offset-2">single or three-phase power input</a>.
            </p>
            <p className="mt-2 text-slate-400 text-sm">
              FSIP GREEN Series · Professional installation · Expert technical support
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a 
                href="#chargers"
                className="inline-flex items-center gap-2 px-6 py-3 bg-canyon-rust text-white font-semibold rounded-lg hover:bg-canyon-rust/90 transition-colors"
              >
                Shop chargers
              </a>
              <a
                href="/quote?equipment=Forklift%20battery%20charger&notes=Need%20help%20matching%20voltage%2C%20amps%2C%20and%20facility%20power"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
              >
                Request a quote
              </a>
              <a
                href="/charger-modules"
                className="inline-flex items-center gap-2 px-6 py-3 border border-slate-500 text-white font-semibold rounded-lg hover:border-canyon-rust hover:text-canyon-rust transition-colors"
              >
                Need a charger module? Reman &amp; repair →
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-400">
              <span>Same-day shipping available</span>
              <span className="hidden sm:inline text-slate-600">·</span>
              <span>All major forklift brands</span>
              <span className="hidden sm:inline text-slate-600">·</span>
              <span>Made in USA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Voltage-first shopping path */}
        <div id="voltage-selection" className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Shop by battery voltage
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Match your forklift battery voltage first, then pick amperage and power input on the product page—or request a quote if you are unsure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-800">24V</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">24V Forklift Chargers</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Ideal for small electric forklifts and pallet jacks. Available in 15A-50A output with single-phase input.
                </p>
                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <div>• Typical: 15A-35A output</div>
                  <div>• Input: 110V-240V single-phase</div>
                  <div>• Applications: Small warehouse forklifts</div>
                </div>
                <a href="/battery-chargers?v=24#chargers" className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors">
                  Browse 24V chargers
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-800">36V</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">36V Forklift Chargers</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Popular for medium-duty electric forklifts. Available in 20A-75A output with single-phase input.
                </p>
                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <div>• Typical: 25A-75A output</div>
                  <div>• Input: 208V-240V single-phase</div>
                  <div>• Applications: Mid-size warehouse forklifts</div>
                </div>
                <a href="/battery-chargers?v=36#chargers" className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors">
                  Browse 36V chargers
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-canyon-rust/30 p-6 ring-1 ring-canyon-rust/20">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-canyon-rust/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-canyon-rust">48V</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">48V Forklift Chargers</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Most common voltage for industrial forklifts. Available in 25A-200A with single or three-phase input.
                </p>
                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <div>• Typical: 50A-150A output</div>
                  <div>• Input: 208V-600V single/three-phase</div>
                  <div>• Applications: Most industrial forklifts</div>
                </div>
                <span className="inline-block bg-canyon-rust/10 text-canyon-rust px-2 py-1 rounded text-xs font-medium mb-3">
                  Most popular
                </span>
                <a href="/battery-chargers?v=48#chargers" className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-canyon-rust text-white text-sm font-semibold rounded-lg hover:bg-canyon-rust/90 transition-colors">
                  Browse 48V chargers
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-800">80V</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">80V Forklift Chargers</h3>
                <p className="text-gray-600 text-sm mb-4">
                  High-capacity chargers for large industrial forklifts. Available in 50A-150A with three-phase input.
                </p>
                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <div>• Typical: 75A-150A output</div>
                  <div>• Input: 480V-600V three-phase</div>
                  <div>• Applications: Heavy-duty forklifts</div>
                </div>
                <a href="/battery-chargers?v=80#chargers" className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors">
                  Browse 80V chargers
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Product catalog — always visible for conversion */}
        <div id="chargers" className="mt-14 scroll-mt-24">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">
                {hasFilters
                  ? voltageLabel
                    ? `${voltageLabel} forklift chargers`
                    : 'Matching chargers'
                  : 'Featured forklift chargers'}
              </h2>
              <p className="text-neutral-600 mt-1">
                {hasFilters
                  ? `${catalogParts.length} charger${catalogParts.length !== 1 ? 's' : ''} match your criteria`
                  : 'Stocked GREEN Series options across common voltages. Filter by voltage above or request a quote for fleet sizing.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {hasFilters && (
                <a
                  href="/battery-chargers#chargers"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-canyon-rust/40 transition-colors"
                >
                  Clear filters
                </a>
              )}
              <a
                href="/quote?equipment=Forklift%20battery%20charger&notes=Need%20help%20matching%20voltage%2C%20amps%2C%20and%20facility%20power"
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-canyon-rust rounded-lg hover:bg-canyon-rust/90 transition-colors"
              >
                Request a quote
              </a>
            </div>
          </div>

          {catalogParts.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-slate-200 bg-white">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                No chargers match your criteria
              </h3>
              <p className="text-neutral-600 mb-4">
                Try another voltage, or send us your battery label and facility power details for a quote.
              </p>
              <a
                href="/quote?equipment=Forklift%20battery%20charger"
                className="inline-flex items-center px-5 py-2.5 bg-canyon-rust text-white font-semibold rounded-lg hover:bg-canyon-rust/90 transition-colors"
              >
                Request a quote
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {catalogParts.map((charger) => (
                <ChargerCard
                  key={charger.id}
                  charger={charger}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quote band */}
        <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-950 px-6 py-8 sm:px-10 text-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold mb-2">Not sure on amps or power input?</h2>
              <p className="text-slate-300">
                Send your forklift model, battery voltage/Ah, and available facility power. We&apos;ll recommend the right charger—or a reman module if that fits better.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href="/quote?equipment=Forklift%20battery%20charger&notes=Need%20help%20matching%20voltage%2C%20amps%2C%20and%20facility%20power"
                className="inline-flex items-center justify-center px-5 py-3 bg-canyon-rust text-white font-semibold rounded-lg hover:bg-canyon-rust/90 transition-colors"
              >
                Request a quote
              </a>
              <a
                href="/charger-modules"
                className="inline-flex items-center justify-center px-5 py-3 border border-slate-500 text-white font-semibold rounded-lg hover:border-canyon-rust hover:text-canyon-rust transition-colors"
              >
                Charger modules
              </a>
            </div>
          </div>
        </div>

        {/* Demoted optional selector — keep #charger-selector for legacy deep links */}
        <div id="charger-selector" className="mt-16 scroll-mt-24">
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
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <a href="#voltage-selection" className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 hover:border-canyon-rust/40 transition-colors">
              <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-xs">1</span>
              <span className="text-gray-700">Shop by voltage</span>
            </a>
            <a href="#chargers" className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 hover:border-canyon-rust/40 transition-colors">
              <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-xs">2</span>
              <span className="text-gray-700">Browse chargers</span>
            </a>
            <a href="#resources" className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 hover:border-canyon-rust/40 transition-colors">
              <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-xs">3</span>
              <span className="text-gray-700">Expert Guides</span>
            </a>
            <a href="#faq" className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 hover:border-canyon-rust/40 transition-colors">
              <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-xs">4</span>
              <span className="text-gray-700">FAQ</span>
            </a>
          </div>
        </div>

        {/* Helpful Resources Section */}
        <div id="resources" className="mt-16 rounded-2xl border border-slate-200 bg-slate-50 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Forklift Charger Resources &amp; Guides
            </h2>
            <p className="text-gray-600">
              Expert guides to help you choose, install, and maintain your forklift battery chargers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                href: '/insights/complete-guide-forklift-battery-chargers',
                title: 'Complete Forklift Charger Guide',
                body: 'Voltage selection, brand compatibility, installation, and troubleshooting in one place.',
                cta: 'Read the complete guide →',
              },
              {
                href: '/insights/how-to-choose-forklift-battery-charger',
                title: 'How to Choose a Charger',
                body: 'Step-by-step selection for voltage, amperage, and facility power.',
                cta: 'Open selection guide →',
              },
              {
                href: '/insights/forklift-charger-voltage-comparison',
                title: '24V vs 36V vs 48V vs 80V',
                body: 'Compare voltages and match the right charger to your forklift.',
                cta: 'Compare voltages →',
              },
              {
                href: '/insights/fast-vs-overnight-forklift-charging',
                title: 'Fast vs Overnight Charging',
                body: 'Trade-offs for multi-shift fleets versus overnight C/10 charging.',
                cta: 'Compare charging methods →',
              },
              {
                href: '/insights/lithium-forklift-battery-chargers-complete-guide',
                title: 'Lithium Charger Guide',
                body: 'BMS-aware charging, opportunity charging, and lithium-specific requirements.',
                cta: 'Learn about lithium →',
              },
              {
                href: '/insights/lead-acid-vs-lithium-forklift-chargers',
                title: 'Lead-Acid vs Lithium',
                body: 'Cost, ROI, and operational differences between charger technologies.',
                cta: 'Compare technologies →',
              },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block rounded-xl border border-slate-200 bg-white p-6 hover:border-canyon-rust/40 transition-colors"
              >
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{item.body}</p>
                <span className="text-canyon-rust font-medium text-sm">{item.cta}</span>
              </a>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <ChargerFAQ />

        {/* Back to Top Navigation */}
        <div className="mt-12 text-center">
          <a href="#top" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
            Back to Top
          </a>
        </div>
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
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-canyon-rust" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Fast Charging Technology</h3>
              <p className="text-neutral-600 text-sm">
                Advanced charging profiles reduce forklift downtime from 12 hours to 4-6 hours, maximizing fleet productivity
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-canyon-rust" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Industrial Reliability</h3>
              <p className="text-neutral-600 text-sm">
                Built for 24/7 warehouse operation with advanced safety features, thermal monitoring, and automatic shutoff protection
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-canyon-rust" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Energy Efficient</h3>
              <p className="text-neutral-600 text-sm">
                High-efficiency designs reduce electricity costs by up to 20% compared to older charger models
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-canyon-rust" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5zM8.25 12l7.5 0" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Expert Technical Support</h3>
              <p className="text-neutral-600 text-sm">
                Professional installation assistance, troubleshooting support, and forklift charger maintenance guidance
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-sm font-bold text-slate-800">USA</span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">American Manufacturing</h3>
              <p className="text-neutral-600 text-sm">
                Made in USA with precision engineering, faster support, and reliable domestic supply chain
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}