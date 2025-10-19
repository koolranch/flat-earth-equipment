import { CHARGER_MODULES } from "@/constants/chargerOptions";
import OptionSelectorCard from "@/components/OptionSelectorCard";
import ChargerModuleTrustBadges from "@/components/ChargerModuleTrustBadges";
import StickyBottomCTA from "@/components/StickyBottomCTA";
import { getUserLocale } from "@/lib/getUserLocale";
import Script from "next/script";
import Link from "next/link";
import { Zap, Building2, FileText, TrendingDown } from "lucide-react";
import QuoteButton from "@/components/QuoteButton";

export const metadata = {
  title: "Forklift Charger Modules | Enersys & Hawker | Exchange & Repair | Flat Earth Equipment",
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
          "url": "https://flatearthequipment.com/charger-modules",
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
              <p className="text-slate-300 text-lg">
                Get volume pricing, NET-30 terms, and dedicated support for your fleet operations.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="flex items-start gap-3">
              <TrendingDown className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-sm">Volume Pricing</div>
                <div className="text-slate-400 text-sm">Save on orders of 4+ units</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-sm">Purchase Orders</div>
                <div className="text-slate-400 text-sm">NET-30 payment terms available</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-sm">Fleet Support</div>
                <div className="text-slate-400 text-sm">Dedicated account management</div>
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
            />
            <p className="text-slate-400 text-sm">
              📧 Response within 24 hours • 📞 Questions? Call us at <a href="tel:+18887654321" className="underline hover:text-white">(888) 765-4321</a>
            </p>
          </div>
        </div>
      </section>

        <ChargerModuleTrustBadges locale={locale} />

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