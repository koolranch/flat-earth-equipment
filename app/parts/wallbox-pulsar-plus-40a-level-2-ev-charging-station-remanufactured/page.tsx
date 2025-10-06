import Image from 'next/image';
import { CheckCircle, Zap, Shield, Truck, Recycle, Smartphone, Clock, Gauge, Wifi, Settings } from 'lucide-react';
import Script from 'next/script';
import AddToCartButton from '@/components/AddToCartButton';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

export const metadata = {
  title: "Wallbox Pulsar Plus 40A Level 2 EV Charging Station (Remanufactured) | Flat Earth Equipment",
  description: "Remanufactured Wallbox Pulsar Plus 40A Level 2 EV charger with smart connectivity, WiFi/Bluetooth control, compact design, and mobile app integration. $600 + $300 refundable core deposit.",
  keywords: "wallbox pulsar plus, smart ev charger, wifi ev charger, 40 amp ev charger, app controlled charger, compact ev charger, level 2 charging station",
};

async function getProduct() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('parts')
    .select('*')
    .eq('slug', 'wallbox-pulsar-plus-40a-level-2-ev-charging-station-remanufactured')
    .single();

  if (error || !data) {
    notFound();
  }

  return data;
}

export default async function WallboxPulsar40APage() {
  const product = await getProduct();

  const features = [
    {
      icon: Smartphone,
      title: "Smart App Control",
      description: "Complete control through the Wallbox mobile app with WiFi and Bluetooth connectivity for remote monitoring"
    },
    {
      icon: Zap,
      title: "Efficient 40A Charging",
      description: "Optimal charging performance with intelligent power management for residential and commercial applications"
    },
    {
      icon: Settings,
      title: "Advanced Scheduling",
      description: "Schedule charging sessions, track energy usage, and optimize charging times for off-peak electricity rates"
    },
    {
      icon: Shield,
      title: "Universal Compatibility",
      description: "Works seamlessly with all current electric vehicles, ensuring future-proof investment for any EV owner"
    },
    {
      icon: Gauge,
      title: "Compact Design",
      description: "Space-efficient design combines powerful performance with minimal installation footprint"
    },
    {
      icon: Wifi,
      title: "Connected Intelligence",
      description: "Real-time monitoring, usage analytics, and remote diagnostics through intelligent connectivity"
    }
  ];

  const benefits = [
    "Premium Smart Technology – Wallbox leads in intelligent EV charging with award-winning design and innovation",
    "Intuitive Mobile Experience – Complete charger control through user-friendly app with advanced features", 
    "Energy Management – Smart scheduling and monitoring help optimize charging costs and energy efficiency"
  ];

  const specs = [
    { label: "Power Output", value: "40A @ 240V" },
    { label: "Connector Type", value: "Universal J1772" },
    { label: "Smart Features", value: "WiFi + Bluetooth" },
    { label: "Mobile App", value: "Wallbox App (iOS/Android)" },
    { label: "Installation", value: "Hardwired (240V)" },
    { label: "Design", value: "Compact, Space-Efficient" },
    { label: "Compatibility", value: "All J1772 EVs + Tesla (with adapter)" },
    { label: "Energy Tracking", value: "Real-time usage monitoring" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Script
        id="wallbox-40a-charger-ld-json"
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
                "value": "40A"
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
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              <Recycle className="h-4 w-4" />
              Eco-Friendly Remanufactured
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900">
              Wallbox Pulsar Plus 40A
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Intelligent Level 2 EV charging with advanced app control, WiFi connectivity, 
              and compact design. The smart solution for residential and commercial charging.
            </p>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-canyon-rust">${product.price}</div>
                  {(product.has_core_charge || (product.core_charge && product.core_charge > 0)) && (
                    <div className="text-sm text-gray-600">+ ${(product.core_charge || 0)} refundable core deposit</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">Smart EV Charging</div>
                  <div className="text-sm text-gray-500">40A @ 240V</div>
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
            <h2 className="text-3xl font-bold">Smart EV Charging Technology</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The Wallbox Pulsar Plus 40A brings intelligent connectivity and advanced features 
              to residential and commercial EV charging.
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
            <h2 className="text-2xl font-bold">Intelligent Charging Experience</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Advanced smart features put you in complete control of your EV charging experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">Mobile App Control</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Remote start/stop charging sessions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Real-time charging status and notifications
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Energy usage tracking and history
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Schedule charging for off-peak rates
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm border">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Wifi className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold">Connected Intelligence</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  WiFi and Bluetooth dual connectivity
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Automatic software updates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Remote diagnostics and support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Integration with smart home systems
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
            <h2 className="text-2xl font-bold">Sustainable Smart Charging</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our remanufactured Wallbox chargers deliver cutting-edge smart technology with environmental responsibility.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-4 p-6 bg-green-50 rounded-xl">
              <div className="mx-auto w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center">
                <Recycle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Sustainable Innovation</h3>
                <p className="text-green-800 text-sm">Remanufactured smart chargers reduce electronic waste while delivering latest technology</p>
              </div>
            </div>
            
            <div className="text-center space-y-4 p-6 bg-green-50 rounded-xl">
              <div className="mx-auto w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Energy Optimization</h3>
                <p className="text-green-800 text-sm">Smart scheduling and monitoring help reduce energy costs and environmental impact</p>
              </div>
            </div>
            
            <div className="text-center space-y-4 p-6 bg-green-50 rounded-xl">
              <div className="mx-auto w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Premium Refurbishment</h3>
                <p className="text-green-800 text-sm">Professional remanufacturing ensures smart features and connectivity work like new</p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Return Process */}
        <section className="bg-gray-50 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center">Simple Core Return Process</h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            Your Wallbox Pulsar Plus includes a ${(product.core_charge || 0)} refundable core deposit. Here's our hassle-free return process:
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="bg-canyon-rust text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto font-bold">1</div>
              <h3 className="font-semibold">Order & Receive</h3>
              <p className="text-sm text-gray-600">We temporarily charge the refundable core deposit. Your smart charger ships immediately.</p>
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
            Ready for Smart EV Charging?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience the future of electric vehicle charging with intelligent connectivity, 
            mobile app control, and professional-grade performance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AddToCartButton 
              sku={product.sku}
              qty={1}
              price={product.price * 100}
              meta={{ productId: product.id }}
              className="bg-canyon-rust text-white px-8 py-3 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors"
            >
              Order Wallbox Pulsar Plus 40A →
            </AddToCartButton>
            <a 
              href="/contact"
              className="border border-canyon-rust text-canyon-rust px-8 py-3 rounded-lg font-semibold hover:bg-canyon-rust/10 transition-colors"
            >
              Get Smart Installation Quote
            </a>
          </div>
        </section>
      </div>
    </div>
  );
} 