import Image from 'next/image';
import { CheckCircle, Zap, Shield, Truck, Recycle, Smartphone, Clock, Gauge } from 'lucide-react';
import Script from 'next/script';
import AddToCartButton from '@/components/AddToCartButton';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

export const metadata = {
  title: "ChargePoint Home Flex Level 2 EV Charger (Remanufactured) - 40A, 9.6kW | Flat Earth Equipment",
  description: "Remanufactured ChargePoint Home Flex Level 2 EV charger with 40A output and 9.6kW power. Smart charging, weather-resistant, universal J1772 compatibility. $450 + $300 refundable core deposit.",
  keywords: "chargepoint home flex, level 2 ev charger, remanufactured ev charger, 40 amp ev charger, electric vehicle charging station, j1772 charger",
};

async function getProduct() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('parts')
    .select('*')
    .eq('slug', 'chargepoint-home-flex-level-2-ev-charger-remanufactured-40a')
    .single();

  if (error || !data) {
    notFound();
  }

  return data;
}

export default async function ChargePointChargerPage() {
  const product = await getProduct();

  const features = [
    {
      icon: Zap,
      title: "6x Faster Charging",
      description: "Level 2 charging adds 25-30 miles of range per hour - dramatically faster than standard 120V outlets"
    },
    {
      icon: Gauge,
      title: "High-Power 9.6kW Output",
      description: "40-amp charging station operates on 220-240V circuits for maximum efficiency"
    },
    {
      icon: Shield,
      title: "Universal Compatibility",
      description: "Works with all J1772-compliant EVs, including Tesla models with adapter"
    },
    {
      icon: Smartphone,
      title: "Smart Connectivity",
      description: "Monitor and schedule charging remotely through the ChargePoint mobile app"
    }
  ];

  const environmentalBenefits = [
    "Reduces electronic waste by giving equipment a second life",
    "Lower carbon footprint compared to manufacturing new units",
    "Professionally refurbished to exceed original specifications",
    "Supports sustainable practices in the EV charging industry"
  ];

  const whyChargePoint = [
    {
      title: "Proven Industry Leadership",
      description: "ChargePoint leads the EV charging market with reliable, cutting-edge technology trusted by millions of drivers worldwide."
    },
    {
      title: "Superior Charging Performance", 
      description: "Experience dramatically reduced charging times and enhanced efficiency, keeping your electric vehicle ready for every journey."
    },
    {
      title: "Advanced Smart Features",
      description: "Take control of your charging experience with remote monitoring, energy tracking, and flexible scheduling through the intuitive ChargePoint app."
    }
  ];

  return (
    <>
      <main className="container mx-auto px-4 lg:px-8 py-12 space-y-16 pb-20 sm:pb-12">
        {/* JSON-LD Structured Data for SEO */}
        <Script id="chargepoint-charger-ld-json" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "sku": product.sku,
            "brand": {
              "@type": "Brand",
              "name": product.brand
            },
            "image": product.image_url,
            "offers": {
              "@type": "Offer",
              "price": product.price.toString(),
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock",
              "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            "additionalProperty": [
              {
                "@type": "PropertyValue",
                "name": "Core Charge",
                "value": product.core_charge ? `$${product.core_charge} (refundable)` : "None"
              },
              {
                "@type": "PropertyValue", 
                "name": "Power Output",
                "value": "9.6kW"
              },
              {
                "@type": "PropertyValue",
                "name": "Amperage",
                "value": "40A"
              }
            ]
          })}
        </Script>

        {/* Hero Section */}
        <header className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              <Recycle className="h-4 w-4" />
              Eco-Friendly Remanufactured
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold">
              ChargePoint Home Flex Level 2 EV Charger
            </h1>
            <p className="text-xl text-gray-600">
              Professional-grade 40A charging station delivering 9.6kW of power for faster, smarter EV charging at home and work.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="text-center sm:text-left">
                <div className="text-3xl font-bold text-canyon-rust">
                  ${product.price.toFixed(0)}
                </div>
                {product.has_core_charge && (
                  <div className="text-sm text-gray-600">
                    + ${product.core_charge.toFixed(0)} refundable core deposit
                  </div>
                )}
              </div>
              <AddToCartButton
                sku={product.sku}
                qty={1}
                price={product.price * 100}
                meta={{ productId: product.id }}
                className="bg-canyon-rust text-white px-8 py-3 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors"
              >
                Buy Now & Ship Today →
              </AddToCartButton>
            </div>
          </div>

          <div className="relative">
            <Image
              src={product.image_url}
              alt="ChargePoint Home Flex Level 2 EV Charger"
              width={500}
              height={500}
              className="rounded-2xl shadow-lg w-full h-auto object-contain"
              priority
            />
          </div>
        </header>

        {/* Key Features */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-center">
            Advanced EV Charging Technology
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4 p-6 bg-white rounded-xl shadow-sm border">
                <div className="flex-shrink-0">
                  <feature.icon className="h-8 w-8 text-canyon-rust" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose ChargePoint */}
        <section className="bg-gray-50 rounded-2xl p-8 space-y-8">
          <h2 className="text-2xl font-bold text-center">
            Why Choose ChargePoint?
          </h2>
          <div className="grid gap-6">
            {whyChargePoint.map((benefit, index) => (
              <div key={index} className="flex gap-4 items-start">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-gray-700">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Environmental Benefits */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">
              Sustainable Choice for a Greener Future
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our remanufactured ChargePoint units deliver the same performance as new while supporting environmental sustainability.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {environmentalBenefits.map((benefit, index) => (
              <div key={index} className="flex gap-3 items-center p-4 bg-green-50 rounded-lg">
                <Recycle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-green-800">{benefit}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Core Return Process */}
        {product.has_core_charge && (
          <section className="bg-blue-50 rounded-2xl p-8 space-y-6">
            <h2 className="text-2xl font-bold text-center text-blue-900">
              Simple Core Return Process
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto font-bold">
                  1
                </div>
                <h3 className="font-semibold">Order & Receive</h3>
                <p className="text-sm text-blue-800">
                  We charge ${product.core_charge.toFixed(0)} refundable deposit. Your remanufactured charger ships immediately.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto font-bold">
                  2
                </div>
                <h3 className="font-semibold">Return Your Old Unit</h3>
                <p className="text-sm text-blue-800">
                  Use our prepaid shipping label to send your old charger within 30 days.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto font-bold">
                  3
                </div>
                <h3 className="font-semibold">Get Your Refund</h3>
                <p className="text-sm text-blue-800">
                  Full ${product.core_charge.toFixed(0)} refund issued within 48 hours of receiving your old unit.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Trust Badges */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Truck, title: "Same-Day Dispatch", desc: "Ships today if ordered before 3 PM EST" },
            { icon: Shield, title: "Quality Guaranteed", desc: "Professionally remanufactured to exceed OEM specs" },
            { icon: Clock, title: "Fast Installation", desc: "Professional hardwired setup for reliable performance" },
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

        {/* Technical Specifications */}
        <section className="bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Technical Specifications</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Power & Performance</h3>
              <ul className="space-y-2 text-sm">
                <li><span className="font-medium">Power Output:</span> 9.6kW (40A)</li>
                <li><span className="font-medium">Voltage:</span> 220-240V AC</li>
                <li><span className="font-medium">Connector:</span> J1772 Universal</li>
                <li><span className="font-medium">Charging Speed:</span> 25-30 miles range/hour</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Installation & Features</h3>
              <ul className="space-y-2 text-sm">
                <li><span className="font-medium">Installation:</span> Professional hardwired</li>
                <li><span className="font-medium">Enclosure:</span> NEMA 3R weather-resistant</li>
                <li><span className="font-medium">Smart Features:</span> ChargePoint app compatible</li>
                <li><span className="font-medium">Safety:</span> Multiple protection systems</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center space-y-6 bg-canyon-rust/5 rounded-2xl p-8">
          <h2 className="text-2xl font-bold">
            Ready to Upgrade Your EV Charging?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust our remanufactured ChargePoint solutions for reliable, fast EV charging.
          </p>
          <AddToCartButton
            sku={product.sku}
            qty={1}
            price={product.price * 100}
            meta={{ productId: product.id }}
            className="bg-canyon-rust text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-canyon-rust/90 transition-colors"
          >
            Order Now - Ships Today →
          </AddToCartButton>
        </section>
      </main>
    </>
  );
} 