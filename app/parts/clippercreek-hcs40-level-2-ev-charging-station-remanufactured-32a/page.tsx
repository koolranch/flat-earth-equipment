import Image from 'next/image';
import { CheckCircle, Zap, Shield, Truck, Recycle, Smartphone, Clock, Gauge, Cable } from 'lucide-react';
import Script from 'next/script';
import AddToCartButton from '@/components/AddToCartButton';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

export const metadata = {
  title: "ClipperCreek HCS-40 Level 2 EV Charging Station (Remanufactured) - 32A, 7.7kW | Flat Earth Equipment",
  description: "Remanufactured ClipperCreek HCS-40 Level 2 EV charger with 32A output and 7.7kW power. UL-listed safety, 25ft cable, weatherproof NEMA 4 design. $550 + $350 refundable core deposit.",
  keywords: "clippercreek hcs-40, level 2 ev charger, remanufactured ev charger, 32 amp ev charger, electric vehicle charging station, j1772 charger, weatherproof ev charger",
};

async function getProduct() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('parts')
    .select('*')
    .eq('slug', 'clippercreek-hcs40-level-2-ev-charging-station-remanufactured-32a')
    .single();

  if (error || !data) {
    notFound();
  }

  return data;
}

export default async function ClipperCreekChargerPage() {
  const product = await getProduct();

  const features = [
    {
      icon: Zap,
      title: "5x Faster Charging",
      description: "Level 2 charging adds up to 25 miles of range per hour - significantly faster than standard 120V outlets"
    },
    {
      icon: Gauge,
      title: "Reliable 7.7kW Output",
      description: "32-amp charging station operates on 220-240V circuits for consistent, efficient charging"
    },
    {
      icon: Shield,
      title: "UL-Listed Safety",
      description: "Built-in overcurrent, overvoltage, and surge protection with professional UL certification"
    },
    {
      icon: Cable,
      title: "Extended 25ft Cable",
      description: "Extra-long charging cable provides flexibility for different parking positions and configurations"
    },
    {
      icon: Clock,
      title: "Weather-Resistant Design",
      description: "NEMA 4-rated weatherproof enclosure suitable for both indoor and outdoor installations"
    },
    {
      icon: Truck,
      title: "Hardwired Reliability",
      description: "Professional hardwired installation ensures secure connection and reduces risk of interruptions"
    }
  ];

  const benefits = [
    "Proven Industry Reliability – ClipperCreek is a trusted American manufacturer with decades of EV charging expertise",
    "Enhanced Safety Standards – UL-listed with comprehensive protection systems for secure charging operations", 
    "Installation Flexibility – Extended cable length and weatherproof design accommodate various installation scenarios"
  ];

  const specs = [
    { label: "Power Output", value: "7.7kW (32A @ 240V)" },
    { label: "Connector Type", value: "Universal J1772" },
    { label: "Cable Length", value: "25 feet" },
    { label: "Enclosure Rating", value: "NEMA 4 (Weatherproof)" },
    { label: "Safety Certification", value: "UL Listed" },
    { label: "Installation", value: "Hardwired (240V)" },
    { label: "Compatibility", value: "All J1772 EVs + Tesla (with adapter)" },
    { label: "Charging Speed", value: "Up to 25 miles range/hour" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Script
        id="clippercreek-charger-ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "brand": {
              "@type": "Brand",
              "name": "ClipperCreek"
            },
            "description": product.description,
            "image": product.image_url,
            "sku": product.sku,
            "offers": {
              "@type": "Offer",
              "price": product.price,
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock",
              "priceValidUntil": "2025-12-31"
            },
            "additionalProperty": [
              {
                "@type": "PropertyValue",
                "name": "Core Charge",
                "value": `$${product.core_charge} (refundable)`
              },
              {
                "@type": "PropertyValue",
                "name": "Power Output",
                "value": "7.7kW"
              },
              {
                "@type": "PropertyValue",
                "name": "Amperage",
                "value": "32A"
              }
            ]
          })
        }}
      />

      <div className="container mx-auto px-4 lg:px-8 py-12 space-y-16">
        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-square bg-white rounded-2xl shadow-lg p-8">
            <Image
              src={product.image_url || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-contain rounded-xl"
              priority
            />
          </div>
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              <Recycle className="h-4 w-4" />
              Eco-Friendly Remanufactured
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900">
              ClipperCreek HCS-40
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Professional-grade Level 2 EV charging station with enhanced safety features, 
              extended cable reach, and weatherproof reliability for home and commercial use.
            </p>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-canyon-rust">${product.price}</div>
                  <div className="text-sm text-gray-600">+ ${product.core_charge} refundable core deposit</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">7.7kW Power Output</div>
                  <div className="text-sm text-gray-500">32A @ 240V</div>
                </div>
              </div>
              
              <AddToCartButton 
                sku={product.sku}
                qty={1}
                price={product.price * 100}
                meta={{ 
                  productId: product.id,
                  hasCore: product.has_core_charge || false,
                  coreCharge: product.core_charge || 0
                }}
                className="w-full bg-canyon-rust text-white py-4 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors text-lg"
              >
                Buy Now & Ship Today →
              </AddToCartButton>
              
              <div className="flex justify-center gap-4 mt-4 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  Same-Day Ship
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Quality Guaranteed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Advanced EV Charging Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The ClipperCreek HCS-40 combines proven reliability with enhanced safety features 
              for professional-grade electric vehicle charging.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-canyon-rust/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-canyon-rust" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why ClipperCreek */}
        <section className="bg-blue-50 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center text-blue-900">Why Choose ClipperCreek?</h2>
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-3 items-start">
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-blue-800">{benefit}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Specifications */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-center">Technical Specifications</h2>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {specs.map((spec, index) => (
                <div key={index} className={`p-4 border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} md:border-r ${Math.floor(index / 2) === Math.floor((specs.length - 1) / 2) ? 'border-b-0' : ''}`}>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">{spec.label}</span>
                    <span className="text-gray-900">{spec.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Environmental Benefits */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Sustainable EV Charging Solution</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our remanufactured ClipperCreek chargers combine environmental responsibility with professional-grade performance.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-4 p-6 bg-green-50 rounded-xl">
              <div className="mx-auto w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center">
                <Recycle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Sustainable Choice</h3>
                <p className="text-green-800 text-sm">Remanufactured chargers reduce electronic waste while delivering like-new performance</p>
              </div>
            </div>
            
            <div className="text-center space-y-4 p-6 bg-green-50 rounded-xl">
              <div className="mx-auto w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Quality Assured</h3>
                <p className="text-green-800 text-sm">Professional remanufacturing process ensures reliability that exceeds original specifications</p>
              </div>
            </div>
            
            <div className="text-center space-y-4 p-6 bg-green-50 rounded-xl">
              <div className="mx-auto w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">American Made</h3>
                <p className="text-green-800 text-sm">ClipperCreek chargers are designed and manufactured in the USA with proven reliability</p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Return Process */}
        <section className="bg-gray-50 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center">Simple Core Return Process</h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            Your ClipperCreek charger includes a ${product.core_charge} refundable core deposit. Here's our hassle-free return process:
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="bg-canyon-rust text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto font-bold">1</div>
              <h3 className="font-semibold">Order & Receive</h3>
              <p className="text-sm text-gray-600">We temporarily charge the refundable core deposit. Your remanufactured charger ships immediately.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="bg-canyon-rust text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto font-bold">2</div>
              <h3 className="font-semibold">Return Your Old Unit</h3>
              <p className="text-sm text-gray-600">Use our prepaid shipping label to send your old charger within 30 days.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="bg-canyon-rust text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto font-bold">3</div>
              <h3 className="font-semibold">Get Your Refund</h3>
              <p className="text-sm text-gray-600">Full core deposit refund issued within 48 hours of receiving your old unit.</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center space-y-6 bg-canyon-rust/5 rounded-2xl p-8">
          <h2 className="text-2xl font-bold">
            Ready for Professional EV Charging?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upgrade to reliable, UL-listed Level 2 charging with the trusted ClipperCreek HCS-40. 
            Professional performance with environmental responsibility.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AddToCartButton 
              sku={product.sku}
              qty={1}
              price={product.price * 100}
              meta={{ 
                productId: product.id,
                hasCore: product.has_core_charge || false,
                coreCharge: product.core_charge || 0
              }}
              className="bg-canyon-rust text-white px-8 py-3 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors"
            >
              Order ClipperCreek HCS-40 →
            </AddToCartButton>
            <a 
              href="/contact"
              className="border border-canyon-rust text-canyon-rust px-8 py-3 rounded-lg font-semibold hover:bg-canyon-rust/10 transition-colors"
            >
              Get Installation Quote
            </a>
          </div>
        </section>
      </div>
    </div>
  );
} 