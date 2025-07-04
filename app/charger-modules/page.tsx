import { CHARGER_MODULES } from "@/constants/chargerOptions";
import OptionSelectorCard from "@/components/OptionSelectorCard";
import ChargerModuleTrustBadges from "@/components/ChargerModuleTrustBadges";
import StickyBottomCTA from "@/components/StickyBottomCTA";
import { getUserLocale } from "@/lib/getUserLocale";
import Script from "next/script";

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

        <ChargerModuleTrustBadges locale={locale} />
      </main>
      
      <StickyBottomCTA locale={locale} />
    </>
  );
} 