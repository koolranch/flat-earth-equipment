import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Zap, Shield, Truck, Recycle, Smartphone, Clock, Gauge, MapPin, Leaf, Battery } from 'lucide-react';
import Script from 'next/script';
import { createClient } from '@/utils/supabase/server';
import AddToCartButton from '@/components/AddToCartButton';

export const metadata = {
  title: "Electric Vehicle Chargers | Level 2 EV Charging Stations | Flat Earth Equipment",
  description: "Professional-grade electric vehicle chargers and EV charging stations. Remanufactured Level 2 chargers with smart features, weather-resistant design, and eco-friendly sustainability.",
  keywords: "electric vehicle chargers, ev chargers, level 2 charging station, ev charging equipment, remanufactured ev chargers, chargepoint, electric car chargers",
};

async function getEVChargers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('parts')
    .select('*')
    .eq('category', 'battery chargers')
    .ilike('name', '%ev%')
    .or('name.ilike.%chargepoint%,name.ilike.%electric vehicle%,name.ilike.%level 2%')
    .order('name');

  // If no EV-specific chargers found, get all battery chargers that could work for EVs
  if (!data || data.length === 0) {
    const { data: allChargers, error: fallbackError } = await supabase
      .from('parts')
      .select('*')
      .eq('category', 'battery chargers')
      .order('name');
    return allChargers || [];
  }

  return data || [];
}

export default async function ElectricVehicleChargersPage() {
  const evChargers = await getEVChargers();

  const features = [
    {
      icon: Zap,
      title: "Fast Level 2 Charging",
      description: "Dramatically reduce charging time with 6x faster speeds than standard 120V outlets"
    },
    {
      icon: Smartphone,
      title: "Smart Connectivity",
      description: "Monitor, schedule, and track charging sessions remotely with mobile app integration"
    },
    {
      icon: Shield,
      title: "Universal Compatibility",
      description: "J1772 connectors work with all electric vehicles, including Tesla with adapter"
    },
    {
      icon: MapPin,
      title: "Versatile Installation",
      description: "Indoor and outdoor rated for home garages, workplaces, and commercial properties"
    }
  ];

  const environmentalBenefits = [
    {
      icon: Recycle,
      title: "Sustainable Choice",
      description: "Remanufactured chargers reduce electronic waste while delivering like-new performance"
    },
    {
      icon: Leaf,
      title: "Lower Carbon Footprint",
      description: "Support environmental responsibility with refurbished equipment that avoids new manufacturing"
    },
    {
      icon: Shield,
      title: "Quality Assured",
      description: "Professional remanufacturing process ensures reliability that exceeds original specifications"
    }
  ];

  const whyEVChargers = [
    "Reduce dependency on public charging networks",
    "Convenient overnight charging at home or work",
    "Significant cost savings compared to public charging",
    "Increase property value with EV charging infrastructure",
    "Support the growing electric vehicle ecosystem"
  ];

  return (
    <>
      <main className="container mx-auto px-4 lg:px-8 py-12 space-y-16 pb-20 sm:pb-12">
        {/* JSON-LD Structured Data for SEO */}
        <Script id="ev-chargers-ld-json" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Electric Vehicle Chargers",
            "description": "Professional-grade electric vehicle chargers and EV charging stations. Remanufactured Level 2 chargers with smart features.",
            "url": "https://flatearthequipment.com/electric-vehicle-chargers",
            "numberOfItems": evChargers.length,
            "itemListElement": evChargers.map((charger, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Product",
                "sku": charger.sku,
                "name": charger.name,
                "brand": {
                  "@type": "Brand",
                  "name": charger.brand
                },
                "image": charger.image_url,
                "description": charger.description,
                "offers": {
                  "@type": "Offer",
                  "price": charger.price.toString(),
                  "priceCurrency": "USD",
                  "availability": "https://schema.org/InStock",
                  "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                },
                "additionalProperty": charger.has_core_charge ? [
                  {
                    "@type": "PropertyValue",
                    "name": "Core Charge",
                    "value": `$${charger.core_charge} (refundable)`
                  }
                ] : []
              }
            }))
          })}
        </Script>

        {/* Hero Section */}
        <header className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            <Recycle className="h-4 w-4" />
            Eco-Friendly Remanufactured Solutions
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold">
            Professional Electric Vehicle Chargers
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Smart Level 2 EV charging stations for faster, more efficient charging at home, work, and commercial locations. 
            Professionally remanufactured for reliability and sustainability.
          </p>
        </header>

        {/* Key Features */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-center">
            Advanced EV Charging Technology
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="text-center space-y-4 p-6 bg-white rounded-xl shadow-sm border">
                <div className="mx-auto w-12 h-12 bg-canyon-rust/10 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-canyon-rust" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Available EV Chargers */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">
              In-Stock EV Charging Solutions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Professional-grade electric vehicle chargers ready to ship today. All units are expertly remanufactured 
              and backed by our quality guarantee.
            </p>
          </div>

          {evChargers.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {evChargers.map((charger) => (
                <article
                  key={charger.id}
                  className="border rounded-xl shadow-sm p-6 flex flex-col bg-white hover:shadow-md transition-shadow"
                >
                  <Link href={`/parts/${charger.slug}`} className="mb-4">
                    <div className="relative aspect-square w-full">
                      <Image
                        src={charger.image_url || '/images/placeholder-charger.jpg'}
                        alt={charger.name}
                        fill
                        className="object-contain rounded-lg"
                        loading="lazy"
                      />
                    </div>
                  </Link>

                  <div className="flex-1 space-y-3">
                    <div className="text-center">
                      <span className="text-sm text-gray-500 font-medium">{charger.brand}</span>
                      <h3 className="font-bold text-lg leading-tight mt-1">
                        <Link href={`/parts/${charger.slug}`} className="hover:text-canyon-rust transition-colors">
                          {charger.name}
                        </Link>
                      </h3>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-3">
                      {charger.description?.slice(0, 120)}...
                    </p>

                    <div className="flex justify-center gap-2 text-xs text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        Same-Day Ship
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Quality Guaranteed
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="text-center">
                      <div className="font-bold text-2xl text-canyon-rust">
                        ${charger.price.toFixed(0)}
                      </div>
                      {charger.has_core_charge && charger.core_charge && (
                        <div className="text-sm text-gray-600">
                          + ${charger.core_charge.toFixed(0)} refundable core deposit
                        </div>
                      )}
                    </div>
                    
                    <AddToCartButton
                      sku={charger.sku}
                      qty={1}
                      price={charger.price * 100}
                      meta={{ productId: charger.id }}
                      className="w-full bg-canyon-rust text-white py-3 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors"
                    >
                      Buy Now & Ship Today →
                    </AddToCartButton>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                More EV Chargers Coming Soon
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                We're expanding our electric vehicle charger inventory. Contact us for specific EV charging requirements.
              </p>
              <Link 
                href="/contact" 
                className="inline-block mt-4 bg-canyon-rust text-white px-6 py-2 rounded-lg hover:bg-canyon-rust/90 transition-colors"
              >
                Contact for EV Charging Solutions
              </Link>
            </div>
          )}
        </section>

        {/* Why Choose EV Charging */}
        <section className="bg-blue-50 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center text-blue-900">
            Why Install Electric Vehicle Charging?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {whyEVChargers.map((benefit, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-blue-800">{benefit}</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-bold text-lg mb-3">Fast Charging Benefits</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Level 2 charging: 6x faster than standard outlets</li>
                <li>• Add 25-30 miles of range per hour of charging</li>
                <li>• Full overnight charging for daily commuting</li>
                <li>• Smart scheduling for off-peak electricity rates</li>
                <li>• Weather-resistant for year-round reliability</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Environmental Benefits */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">
              Sustainable EV Charging Solutions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our remanufactured EV chargers combine environmental responsibility with professional-grade performance.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {environmentalBenefits.map((benefit, index) => (
              <div key={index} className="text-center space-y-4 p-6 bg-green-50 rounded-xl">
                <div className="mx-auto w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center">
                  <benefit.icon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-green-800 text-sm">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Core Return Process */}
        <section className="bg-gray-50 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center">
            Simple Core Return Process
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            Many of our EV chargers include a refundable core deposit. Here's how our hassle-free return process works:
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="bg-canyon-rust text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto font-bold">
                1
              </div>
              <h3 className="font-semibold">Order & Receive</h3>
              <p className="text-sm text-gray-600">
                We temporarily charge the refundable core deposit. Your remanufactured EV charger ships immediately.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="bg-canyon-rust text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto font-bold">
                2
              </div>
              <h3 className="font-semibold">Return Your Old Unit</h3>
              <p className="text-sm text-gray-600">
                Use our prepaid shipping label to send your old charger within 30 days.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="bg-canyon-rust text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto font-bold">
                3
              </div>
              <h3 className="font-semibold">Get Your Refund</h3>
              <p className="text-sm text-gray-600">
                Full core deposit refund issued within 48 hours of receiving your old unit.
              </p>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Truck, title: "Same-Day Dispatch", desc: "Ships today if ordered before 3 PM EST" },
            { icon: Shield, title: "Quality Guaranteed", desc: "Professionally remanufactured to exceed OEM specs" },
            { icon: Clock, title: "Fast Installation", desc: "Professional hardwired setup available" },
            { icon: Recycle, title: "Eco-Friendly", desc: "Sustainable choice supporting environmental responsibility" }
          ].map((badge, index) => (
            <div key={index} className="text-center space-y-3 p-4 bg-white rounded-lg shadow-sm">
              <badge.icon className="h-8 w-8 text-canyon-rust mx-auto" />
              <div>
                <h3 className="font-semibold text-sm">{badge.title}</h3>
                <p className="text-xs text-gray-600">{badge.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Cross-promotion to Forklift Charger Modules */}
        <section className="bg-orange-50 rounded-2xl p-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-orange-600/10 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
            <Battery className="h-4 w-4" />
            Also Available
          </div>
          <h2 className="text-2xl font-bold text-orange-900">
            Need Forklift Charger Modules?
          </h2>
          <p className="text-orange-800 max-w-2xl mx-auto">
            We also specialize in forklift charger modules with instant exchange and repair options. 
            Same quality remanufacturing process and environmental benefits for your industrial fleet.
          </p>
          <Link
            href="/charger-modules"
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            <Battery className="h-5 w-5" />
            Shop Forklift Charger Modules →
          </Link>
        </section>

        {/* Final CTA */}
        <section className="text-center space-y-6 bg-canyon-rust/5 rounded-2xl p-8">
          <h2 className="text-2xl font-bold">
            Ready to Upgrade to Electric Vehicle Charging?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join the electric vehicle revolution with professional-grade charging solutions. 
            Fast, smart, and environmentally responsible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/parts?category=battery+chargers"
              className="bg-canyon-rust text-white px-8 py-3 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors"
            >
              Browse All EV Chargers →
            </Link>
            <Link
              href="/contact"
              className="border border-canyon-rust text-canyon-rust px-8 py-3 rounded-lg font-semibold hover:bg-canyon-rust/10 transition-colors"
            >
              Get Custom EV Solution
            </Link>
          </div>
        </section>
      </main>
    </>
  );
} 