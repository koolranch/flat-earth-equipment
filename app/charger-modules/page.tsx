import { CHARGER_MODULES } from "@/constants/chargerOptions";
import OptionSelectorCard from "@/components/OptionSelectorCard";
import ChargerModuleTrustBadges from "@/components/ChargerModuleTrustBadges";
import StickyBottomCTA from "@/components/StickyBottomCTA";
import { getUserLocale } from "@/lib/getUserLocale";
import Script from "next/script";
import Link from "next/link";
import { Zap, Building2, FileText, TrendingDown, Leaf, Award, DollarSign } from "lucide-react";
import QuoteButton from "@/components/QuoteButton";
import TechnicalSpecsTable, { CHARGER_MODULE_SPECS } from "@/components/seo/TechnicalSpecsTable";

export const metadata = {
  title: "Charger Modules | Enersys & Hawker | Repair",
  description: "In-stock remanufactured forklift charger modules for Enersys & Hawker. Choose instant exchange or send-in repair service. 6-month warranty, free shipping nationwide.",
  keywords: "forklift charger modules, enersys charger module, hawker charger module, forklift charger repair, charger module exchange",
};

export default function ChargersLanding() {
  const locale = getUserLocale();

  const t = {
    en: {
      title: "In-Stock Reman & Repair Charger Modules",
      subtitle: "Choose instant exchange or send-in repair—both backed by our 6-month warranty and free nationwide shipping."
    },
    es: {
      title: "Módulos de Cargador Remanufacturados y Reparación en Stock",
      subtitle: "Elija intercambio instantáneo o reparación por envío—ambos respaldados por nuestra garantía de 6 meses y envío gratuito a nivel nacional."
    }
  }[locale];

  return (
    <>
      <main className="container mx-auto px-4 lg:px-8 py-12 space-y-16 pb-20 sm:pb-12">
        {/* JSON-LD Structured Data for SEO */}
      <Script id="charger-modules-ld-json" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Forklift Charger Modules",
          "description": "In-stock remanufactured forklift charger modules for Enersys & Hawker. Choose instant exchange or send-in repair service.",
          "url": "https://www.flatearthequipment.com/charger-modules",
          "numberOfItems": CHARGER_MODULES.length * 2, // Each module has 2 offers
          "itemListElement": CHARGER_MODULES.flatMap((module, moduleIndex) => 
            module.offers.map((offer, offerIndex) => ({
              "@type": "ListItem",
              "position": moduleIndex * 2 + offerIndex + 1,
              "item": {
                "@type": "Product",
                "sku": module.partNumber,
                "name": `${module.title} (${offer.label})`,
                "brand": {
                  "@type": "Brand",
                  "name": module.brand
                },
                "image": offer.label === "Repair & Return" ? module.imgRepair : module.imgExchange,
                "description": offer.desc,
                "offers": {
                  "@type": "Offer",
                  "price": (offer.price / 100).toFixed(2),
                  "priceCurrency": "USD",
                  "availability": "https://schema.org/InStock",
                  "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
                }
              }
            }))
          )
        })}
      </Script>

      <header className="text-center space-y-4">
        <h1 className="text-3xl lg:text-4xl font-extrabold">
          {t.title}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </header>

      <section className="grid gap-12 md:grid-cols-2">
        {CHARGER_MODULES.map((m) => (
          <OptionSelectorCard key={m.id} module={m} locale={locale} />
        ))}
      </section>

      {/* Customer Testimonial */}
      <section className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6 lg:p-8 max-w-4xl mx-auto">
        <blockquote className="space-y-3">
          <p className="text-lg lg:text-xl italic text-slate-700 leading-relaxed">
            "Ordered at 2 PM, charger arrived next day. Back up and running in 24 hours. Saved $400 vs buying new."
          </p>
          <footer className="text-sm text-slate-600 font-medium">
            — Mike R., Maintenance Manager, Dallas TX
          </footer>
        </blockquote>
      </section>

      {/* Corporate Buyer / Fleet CTA */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 lg:p-10 text-white shadow-xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold mb-2">
                Corporate & Fleet Buyer?
              </h2>
              <p className="text-slate-200 text-lg">
                Get volume pricing, NET-30 terms, and dedicated support for your fleet operations.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="flex items-start gap-3">
              <TrendingDown className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Volume Pricing</div>
                <div className="text-slate-300 text-sm">Save on orders of 4+ units</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Purchase Orders</div>
                <div className="text-slate-300 text-sm">NET-30 payment terms available</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Fleet Support</div>
                <div className="text-slate-300 text-sm">Dedicated account management</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <QuoteButton 
              product={{
                name: "Forklift Charger Modules - Corporate/Fleet Quote",
                slug: "charger-modules-fleet",
                sku: "FLEET-CHARGERS"
              }}
              variant="light"
            />
            <p className="text-slate-200 text-sm">
              📧 Response within 24 hours
            </p>
          </div>
        </div>
      </section>

        <ChargerModuleTrustBadges locale={locale} />

        {/* Why Remanufactured? Education Section */}
        <section className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8 lg:p-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-slate-900 mb-8">
            Why Choose Remanufactured?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Environmental Impact</h3>
              <p className="text-slate-700 leading-relaxed">
                Reduces electronic waste and carbon footprint. Each remanufactured module keeps 15-20 lbs of materials out of landfills.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Certified Quality</h3>
              <p className="text-slate-700 leading-relaxed">
                Bench-tested to exceed OEM specifications. Every module undergoes rigorous multi-point inspection and performance validation.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Significant Savings</h3>
              <p className="text-slate-700 leading-relaxed">
                Save 40-60% compared to new OEM parts with identical performance and reliability. Same 6-month warranty coverage.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Specifications - SEO Information Gain */}
        <section className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Technical Specifications</h2>
          <p className="text-slate-600 mb-6">
            All remanufactured charger modules are tested to exceed OEM specifications.
          </p>
          <TechnicalSpecsTable 
            title="Enersys/Hawker Charger Module Specifications"
            specs={CHARGER_MODULE_SPECS}
            footnote="Specifications vary by model. Contact us for compatibility verification with your specific charger."
          />
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">Frequently Asked Questions</h2>
          <div className="divide-y divide-slate-200 space-y-4">
            <details className="group pt-4 first:pt-0">
              <summary className="cursor-pointer font-semibold text-slate-900 hover:text-[#F76511] transition-colors list-none flex items-center justify-between">
                <span className="text-base">What's included in the remanufacturing process?</span>
                <span className="text-slate-500 group-open:rotate-180 transition-transform ml-2">▼</span>
              </summary>
              <p className="text-base text-slate-700 mt-3 leading-relaxed">
                Every module undergoes complete disassembly, component-level inspection, replacement of worn parts, firmware updates, and rigorous bench testing. We test at multiple voltage levels and load conditions to ensure it meets or exceeds OEM specifications before shipping.
              </p>
            </details>

            <details className="group pt-4">
              <summary className="cursor-pointer font-semibold text-slate-900 hover:text-[#F76511] transition-colors list-none flex items-center justify-between">
                <span className="text-base">How does the core refund work?</span>
                <span className="text-slate-500 group-open:rotate-180 transition-transform ml-2">▼</span>
              </summary>
              <p className="text-base text-slate-700 mt-3 leading-relaxed">
                For exchange orders, we charge a $350 refundable core deposit at checkout. You'll receive a prepaid shipping label with your new module. Ship your old module back within 30 days, and we'll refund the full $350 to your original payment method within 48 hours of receiving it.
              </p>
            </details>

            <details className="group pt-4">
              <summary className="cursor-pointer font-semibold text-slate-900 hover:text-[#F76511] transition-colors list-none flex items-center justify-between">
                <span className="text-base">What if my firmware version isn't listed?</span>
                <span className="text-slate-500 group-open:rotate-180 transition-transform ml-2">▼</span>
              </summary>
              <p className="text-base text-slate-700 mt-3 leading-relaxed">
                Leave the firmware field blank or enter "unknown." Our team will email you within 2 hours to confirm compatibility before shipping. We maintain multiple firmware versions in stock and can match your specific charger model.
              </p>
            </details>

            <details className="group pt-4">
              <summary className="cursor-pointer font-semibold text-slate-900 hover:text-[#F76511] transition-colors list-none flex items-center justify-between">
                <span className="text-base">Do you offer installation support?</span>
                <span className="text-slate-500 group-open:rotate-180 transition-transform ml-2">▼</span>
              </summary>
              <p className="text-base text-slate-700 mt-3 leading-relaxed">
                Yes. Every module ships with detailed installation instructions. Our U.S.-based technical support team is available via phone and email to guide you through installation, troubleshooting, or configuration questions at no additional charge.
              </p>
            </details>

            <details className="group pt-4">
              <summary className="cursor-pointer font-semibold text-slate-900 hover:text-[#F76511] transition-colors list-none flex items-center justify-between">
                <span className="text-base">What's your return policy?</span>
                <span className="text-slate-500 group-open:rotate-180 transition-transform ml-2">▼</span>
              </summary>
              <p className="text-base text-slate-700 mt-3 leading-relaxed">
                30-day satisfaction guarantee. If the module doesn't perform as expected, contact us for a prepaid return label. We'll issue a full refund (including core deposit if applicable) upon receiving the return. Our 6-month warranty covers any defects or performance issues.
              </p>
            </details>
          </div>
        </section>

        {/* Cross-promotion to EV Chargers */}
        <section className="bg-blue-50 rounded-2xl p-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
            <Zap className="h-4 w-4" />
            Also Available
          </div>
          <h2 className="text-2xl font-bold text-blue-900">
            Need Electric Vehicle Chargers?
          </h2>
          <p className="text-blue-800 max-w-2xl mx-auto">
            Discover our professional-grade Level 2 EV charging stations. Remanufactured ChargePoint and other premium brands 
            with the same quality guarantee and environmental benefits.
          </p>
          <Link
            href="/electric-vehicle-chargers"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Zap className="h-5 w-5" />
            Shop EV Chargers →
          </Link>
        </section>
      </main>
      
      <StickyBottomCTA locale={locale} />
    </>
  );
} 