import Image from 'next/image';
import { CheckCircle, Zap, Shield, Truck, Recycle, Smartphone, Clock, Gauge, Wifi, Settings, Bolt } from 'lucide-react';
import Script from 'next/script';
import AddToCartButton from '@/components/AddToCartButton';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

export const metadata = {
  title: "Wallbox Pulsar Plus 48A Level 2 EV Charging Station (Remanufactured) - Maximum Power | Flat Earth Equipment",
  description: "Remanufactured Wallbox Pulsar Plus 48A Level 2 EV charger with maximum 48A output, smart connectivity, WiFi/Bluetooth control, and mobile app integration. $600 + $300 refundable core deposit.",
  keywords: "wallbox pulsar plus 48a, maximum power ev charger, 48 amp ev charger, fast ev charging, smart ev charger, wifi ev charger, level 2 charging station",
};

async function getProduct() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('parts')
    .select('*')
    .eq('slug', 'wallbox-pulsar-plus-48a-level-2-ev-charging-station-remanufactured')
    .single();

  if (error || !data) {
    notFound();
  }

  return data;
}

export default async function WallboxPulsar48APage() {
  const product = await getProduct();

  const features = [
    {
      icon: Bolt,
      title: "Maximum 48A Charging",
      description: "Industry-leading 48-amp output delivers fastest possible Level 2 charging speeds for residential installations"
    },
    {
      icon: Smartphone,
      title: "Smart App Control",
      description: "Complete control through the Wallbox mobile app with WiFi and Bluetooth connectivity for remote monitoring"
    },
    {
      icon: Settings,
      title: "Advanced Power Management",
      description: "Intelligent load balancing and scheduling optimize charging times for maximum efficiency and cost savings"
    },
    {
      icon: Shield,
      title: "Universal Compatibility",
      description: "Works seamlessly with all current electric vehicles, maximizing charging speed for any EV"
    },
    {
      icon: Gauge,
      title: "Compact High-Power Design",
      description: "Space-efficient design delivers maximum power output without compromising installation flexibility"
    },
    {
      icon: Wifi,
      title: "Connected Intelligence",
      description: "Real-time monitoring, usage analytics, and remote diagnostics through intelligent connectivity"
    }
  ];

  const benefits = [
    "Maximum Charging Performance – 48A output provides the fastest residential Level 2 charging available",
    "Premium Smart Technology – Award-winning Wallbox innovation with intuitive mobile app experience", 
    "Intelligent Energy Management – Advanced scheduling and load balancing optimize cost and efficiency"
  ];

  const specs = [
    { label: "Power Output", value: "48A @ 240V (Maximum)" },
    { label: "Connector Type", value: "Universal J1772" },
    { label: "Smart Features", value: "WiFi + Bluetooth" },
    { label: "Mobile App", value: "Wallbox App (iOS/Android)" },
    { label: "Installation", value: "Hardwired (240V)" },
    { label: "Design", value: "Compact, High-Power" },
    { label: "Compatibility", value: "All J1772 EVs + Tesla (with adapter)" },
    { label: "Charging Speed", value: "Maximum residential Level 2 speed" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Script
        id="wallbox-48a-charger-ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "brand": {
              "@type": "Brand",
              "name": "Wallbox"
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
                "name": "Amperage",
                "value": "48A (Maximum)"
              },
              {
                "@type": "PropertyValue",
                "name": "Smart Features",
                "value": "WiFi + Bluetooth + Mobile App"
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
            <div className="flex gap-2">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                <Recycle className="h-4 w-4" />
                Eco-Friendly Remanufactured
              </div>
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                <Bolt className="h-4 w-4" />
                Maximum Power
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900">
              Wallbox Pulsar Plus 48A
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Maximum-power intelligent Level 2 EV charging with industry-leading 48A output, 
              advanced app control, and smart connectivity for the fastest residential charging available.
            </p>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-canyon-rust">${product.price}</div>
                  <div className="text-sm text-gray-600">+ ${product.core_charge} refundable core deposit</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">Maximum Power</div>
                  <div className="text-sm text-gray-500">48A @ 240V</div>
                </div>
              </div>
              
              <AddToCartButton 
                sku={product.sku}
                qty={1}
                price={product.price * 100}
                meta={{ productId: product.id }}
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
            <h2 className="text-3xl font-bold">Maximum-Power Smart EV Charging</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The Wallbox Pulsar Plus 48A delivers the fastest residential Level 2 charging available, 
              combined with intelligent connectivity and advanced features.
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

        {/* Maximum Power Callout */}
        <section className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-200">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
              <Bolt className="h-4 w-4" />
              Maximum Residential Power
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Fastest Level 2 Charging Available</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              At 48 amps, this Wallbox Pulsar Plus delivers the maximum power possible for residential 
              Level 2 charging installations. Experience the fastest home charging speeds available without 
              upgrading to expensive commercial-grade infrastructure.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">48A</div>
                <div className="text-sm text-gray-600">Maximum Amperage</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">11.5kW</div>
                <div className="text-sm text-gray-600">Peak Power Output</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">40+</div>
                <div className="text-sm text-gray-600">Miles/Hour Range</div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Wallbox */}
        <section className="bg-blue-50 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center text-blue-900">Why Choose Wallbox?</h2>
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-3 items-start">
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-blue-800">{benefit}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Smart Features Showcase */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Advanced Smart Charging Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Maximum power output combined with intelligent features for the ultimate EV charging experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">Intelligent Control</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Dynamic power adjustment (1-48A)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Smart load balancing for home circuits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Time-of-use rate optimization
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Real-time power monitoring
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm border">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Wifi className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold">Connected Performance</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  WiFi and Bluetooth connectivity
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Over-the-air software updates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Remote diagnostics and support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Energy usage analytics and reporting
                </li>
              </ul>
            </div>
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
            <h2 className="text-2xl font-bold">Maximum Power, Sustainable Choice</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our remanufactured Wallbox chargers deliver maximum charging performance while prioritizing environmental responsibility.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-4 p-6 bg-green-50 rounded-xl">
              <div className="mx-auto w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center">
                <Recycle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Sustainable Performance</h3>
                <p className="text-green-800 text-sm">Maximum-power remanufactured chargers reduce electronic waste while delivering peak performance</p>
              </div>
            </div>
            
            <div className="text-center space-y-4 p-6 bg-green-50 rounded-xl">
              <div className="mx-auto w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center">
                <Bolt className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Efficient Energy Use</h3>
                <p className="text-green-800 text-sm">Smart power management optimizes energy consumption and reduces charging time</p>
              </div>
            </div>
            
            <div className="text-center space-y-4 p-6 bg-green-50 rounded-xl">
              <div className="mx-auto w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Premium Refurbishment</h3>
                <p className="text-green-800 text-sm">Professional remanufacturing ensures maximum power output and smart features perform like new</p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Return Process */}
        <section className="bg-gray-50 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center">Simple Core Return Process</h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            Your Wallbox Pulsar Plus 48A includes a ${product.core_charge} refundable core deposit. Here's our hassle-free return process:
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="bg-canyon-rust text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto font-bold">1</div>
              <h3 className="font-semibold">Order & Receive</h3>
              <p className="text-sm text-gray-600">We temporarily charge the refundable core deposit. Your maximum-power charger ships immediately.</p>
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
            Ready for Maximum EV Charging Power?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience the fastest residential Level 2 charging available with intelligent connectivity, 
            mobile app control, and industry-leading 48A performance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AddToCartButton 
              sku={product.sku}
              qty={1}
              price={product.price * 100}
              meta={{ productId: product.id }}
              className="bg-canyon-rust text-white px-8 py-3 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors"
            >
              Order Wallbox Pulsar Plus 48A →
            </AddToCartButton>
            <a 
              href="/contact"
              className="border border-canyon-rust text-canyon-rust px-8 py-3 rounded-lg font-semibold hover:bg-canyon-rust/10 transition-colors"
            >
              Get Maximum Power Installation Quote
            </a>
          </div>
        </section>
      </div>
    </div>
  );
} 