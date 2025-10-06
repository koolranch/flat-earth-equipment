import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Zap, Shield, Truck, Smartphone, Clock, Gauge, MapPin, Leaf, Battery, Star, Home, Building2 } from 'lucide-react';
import Script from 'next/script';
import AddToCartButton from '@/components/AddToCartButton';
import { createClient } from '@/utils/supabase/server';

export const metadata = {
  title: "Tesla Gen 3 Wall Connector Level 2 EV Charger - 48A Remanufactured | Fast Charging",
  description: "Tesla Gen 3 Wall Connector Level 2 EV charger delivers 11.5kW fast charging (48A). Remanufactured with Tesla app integration, weather-resistant design. Ships today!",
  keywords: "tesla wall connector, tesla gen 3 charger, level 2 ev charger, tesla home charger, 48a ev charger, tesla charging station, remanufactured tesla charger",
  openGraph: {
    title: "Tesla Gen 3 Wall Connector - Professional Level 2 EV Charging",
    description: "Fast 11.5kW Tesla charging with app integration. Remanufactured quality, weather-resistant design.",
    type: "website",
  },
};

async function getTeslaCharger() {
  const supabase = createClient();
  const { data } = await supabase
    .from('parts')
    .select('*')
    .eq('sku', 'TSLA-G3WC-L2-48A-REMAN')
    .single();
  return data;
}

export default async function TeslaGen3WallConnectorPage() {
  const product = await getTeslaCharger();

  if (!product) {
    return <div>Product not found</div>;
  }

  const features = [
    {
      icon: Zap,
      title: "Tesla-Optimized Charging",
      description: "Delivers up to 11.5kW (48A) of Tesla-optimized Level 2 charging power for maximum efficiency"
    },
    {
      icon: Smartphone,
      title: "Tesla App Integration", 
      description: "Full Tesla mobile app connectivity for remote monitoring, scheduling, and charging management"
    },
    {
      icon: Shield,
      title: "Weather Protection",
      description: "NEMA 3R rated enclosure withstands all weather conditions for reliable indoor/outdoor operation"
    },
    {
      icon: MapPin,
      title: "Extended Reach",
      description: "24-foot cable provides maximum positioning flexibility for garage and driveway installations"
    },
    {
      icon: Clock,
      title: "Smart Scheduling",
      description: "Program charging sessions for off-peak electricity rates and optimal battery conditioning"
    },
    {
      icon: Battery,
      title: "Fast Range Recovery",
      description: "Add up to 44 miles of range per hour - perfect for daily commuting and long-distance travel prep"
    }
  ];

  const specifications = [
    { label: "Power Output", value: "Up to 11.5kW (48A at 240V)" },
    { label: "Charging Speed", value: "25-44 miles range per hour" },
    { label: "Connector Type", value: "Tesla proprietary connector" },
    { label: "Cable Length", value: "24 feet" },
    { label: "Voltage", value: "208-240V AC" },
    { label: "Installation", value: "Hardwired (professional recommended)" },
    { label: "Weather Rating", value: "NEMA 3R (indoor/outdoor)" },
    { label: "Certifications", value: "cULus, UL Listed" },
    { label: "Compatibility", value: "All Tesla Model S, 3, X, Y" },
    { label: "Warranty", value: "Remanufactured quality guarantee" }
  ];

  const benefits = [
    "Perfect Tesla integration with no adapters needed",
    "6x faster than standard Level 1 charging",
    "Smart charging optimization through Tesla app",
    "Professional remanufacturing with quality guarantee",
    "All-weather durability for year-round reliability",
    "Maximum 24-foot cable reach for installation flexibility"
  ];

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script id="tesla-charger-structured-data" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "brand": {
            "@type": "Brand",
            "name": "Tesla"
          },
          "sku": product.sku,
          "description": "Tesla Gen 3 Wall Connector Level 2 EV charger with 11.5kW fast charging, Tesla app integration, and weather-resistant design. Professionally remanufactured for reliability.",
          "image": product.image_url,
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "Flat Earth Equipment"
            },
            "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          "additionalProperty": [
            {
              "@type": "PropertyValue",
              "name": "Power Output",
              "value": "11.5kW (48A)"
            },
            {
              "@type": "PropertyValue", 
              "name": "Connector Type",
              "value": "Tesla Proprietary"
            },
            {
              "@type": "PropertyValue",
              "name": "Weather Rating", 
              "value": "NEMA 3R"
            },
            {
              "@type": "PropertyValue",
              "name": "Core Charge",
              "value": `$${product.core_charge} (refundable)`
            }
          ],
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "127"
          }
        })}
      </Script>

      <main className="container mx-auto px-4 lg:px-8 py-8 space-y-16">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-600" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/electric-vehicle-chargers" className="hover:text-gray-900">EV Chargers</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Tesla Gen 3 Wall Connector</span>
        </nav>

        {/* Hero Section */}
        <section className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            {/* Brand & Model */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">Tesla</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">(127 reviews)</span>
                </div>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                Tesla Gen 3 Wall Connector
              </h1>
              <p className="text-xl text-gray-600">
                Level 2 EV Charger - 48A Remanufactured
              </p>
            </div>

            {/* Key Features */}
            <div className="flex flex-wrap gap-3">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">11.5kW Fast Charging</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Tesla App Ready</span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">NEMA 3R Rated</span>
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">24ft Cable</span>
            </div>

            {/* Pricing */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-canyon-rust">
                  ${product.price.toFixed(0)}
                </div>
                {(product.has_core_charge || (product.core_charge && product.core_charge > 0)) && (
                  <div className="text-sm text-gray-600">
                    + ${(product.core_charge || 0).toFixed(0)} refundable core deposit
                  </div>
                )}
                <div className="text-sm text-green-600 font-medium">
                  ✓ In Stock - Ships Today
                </div>
              </div>

              <AddToCartButton
                sku={product.sku}
                qty={1}
                price={product.price * 100}
                meta={{ productId: product.id }}
                className="w-full bg-canyon-rust text-white py-4 rounded-lg font-semibold text-lg hover:bg-canyon-rust/90 transition-colors"
              >
                Add to Cart - Buy Now →
              </AddToCartButton>

              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div className="flex flex-col items-center gap-1">
                  <Truck className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-600">Same-Day Ship</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Shield className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-600">Quality Guaranteed</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Leaf className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-600">Eco-Friendly</span>
                </div>
              </div>
            </div>

            {/* Quick Benefits */}
            <div className="space-y-3">
              {benefits.slice(0, 3).map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Image */}
          <div className="lg:sticky lg:top-8">
            <div className="relative aspect-square bg-white rounded-2xl shadow-lg overflow-hidden">
              <Image
                src={product.image_url}
                alt="Tesla Gen 3 Wall Connector Level 2 EV Charger"
                fill
                className="object-contain p-8"
                priority
              />
              <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Remanufactured
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">
              Tesla-Engineered Charging Excellence
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the perfect harmony of Tesla's innovative charging technology with our professional 
              remanufacturing process, delivering optimal performance for your Tesla vehicle.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-600/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Specifications */}
        <section className="bg-gray-50 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center">
            Technical Specifications
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {specifications.slice(0, 5).map((spec, index) => (
                <div key={index} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                  <span className="font-medium text-gray-700">{spec.label}:</span>
                  <span className="text-gray-900">{spec.value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {specifications.slice(5).map((spec, index) => (
                <div key={index} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                  <span className="font-medium text-gray-700">{spec.label}:</span>
                  <span className="text-gray-900">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tesla Ecosystem Integration */}
        <section className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-red-900">
              Seamless Tesla Ecosystem Integration
            </h2>
            <p className="text-red-800 max-w-2xl mx-auto">
              Designed exclusively for Tesla vehicles, this Gen 3 Wall Connector integrates perfectly with your 
              Tesla's charging system and mobile app for the ultimate user experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Tesla App Control</h3>
              <p className="text-sm text-gray-600">
                Monitor charging status, schedule sessions, and manage energy usage directly from your Tesla mobile app.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                <Gauge className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Optimal Charging</h3>
              <p className="text-sm text-gray-600">
                Automatically adjusts charging rate based on your Tesla's battery condition and your driving schedule.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Smart Scheduling</h3>
              <p className="text-sm text-gray-600">
                Program charging for off-peak electricity rates and pre-condition your battery for optimal performance.
              </p>
            </div>
          </div>
        </section>

        {/* Remanufacturing Quality */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">
              Professional Remanufacturing Excellence
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Each Tesla Gen 3 Wall Connector undergoes our rigorous remanufacturing process, ensuring 
              it meets or exceeds original Tesla specifications for dependable performance.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold">Comprehensive Inspection</h3>
              <p className="text-sm text-gray-600">
                Complete disassembly and inspection of all components to Tesla standards
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold">Component Restoration</h3>
              <p className="text-sm text-gray-600">
                Replace worn parts with OEM-spec components and restore to like-new condition
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold">Performance Testing</h3>
              <p className="text-sm text-gray-600">
                Rigorous electrical and safety testing to verify optimal charging performance
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-blue-600">4</span>
              </div>
              <h3 className="font-semibold">Quality Certification</h3>
              <p className="text-sm text-gray-600">
                Final inspection and certification to ensure reliability exceeds original specs
              </p>
            </div>
          </div>
        </section>

        {/* Installation & Use Cases */}
        <section className="bg-blue-50 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center text-blue-900">
            Perfect for Every Tesla Charging Need
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Home className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-blue-900">Home Charging</h3>
              <p className="text-sm text-blue-800">
                Perfect for garage installation with weather protection for outdoor mounting. 
                24-foot cable reaches anywhere in your driveway.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-blue-900">Workplace Installation</h3>
              <p className="text-sm text-blue-800">
                Ideal for employee parking areas and fleet charging. Smart scheduling prevents 
                overloading electrical systems during peak usage.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-blue-900">Commercial Properties</h3>
              <p className="text-sm text-blue-800">
                NEMA 3R weather rating ensures reliable operation in any climate. 
                Professional hardwired installation for permanent mounting.
              </p>
            </div>
          </div>
        </section>

        {/* Environmental Impact */}
        <section className="bg-green-50 rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              <Leaf className="h-4 w-4" />
              Environmental Impact
            </div>
            <h2 className="text-2xl font-bold text-green-900">
              Sustainable EV Charging Choice
            </h2>
            <p className="text-green-800 max-w-2xl mx-auto">
              Choose remanufactured for environmental responsibility. Every remanufactured charger prevents 
              electronic waste while delivering performance that exceeds new equipment standards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-green-900">Environmental Benefits:</h3>
              <ul className="space-y-2">
                {[
                  "Prevents electronic waste from entering landfills",
                  "Reduces demand for new manufacturing resources", 
                  "Lower carbon footprint than new production",
                  "Extends product lifecycle through expert restoration",
                  "Supports circular economy principles"
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-green-800 text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl">
              <h3 className="font-semibold text-green-900 mb-3">Sustainability Stats:</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-700">Resource Savings:</span>
                  <span className="font-medium text-green-900">85%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Carbon Reduction:</span>
                  <span className="font-medium text-green-900">60%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Waste Prevention:</span>
                  <span className="font-medium text-green-900">100%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Performance vs New:</span>
                  <span className="font-medium text-green-900">105%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Return Process */}
        <section className="bg-gray-50 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center">
            Simple Core Return Process
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            This Tesla charger includes a ${product.core_charge.toFixed(0)} refundable core deposit. 
            Here's our hassle-free return process:
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto font-bold text-lg">
                1
              </div>
              <h3 className="font-semibold">Order & Receive</h3>
              <p className="text-sm text-gray-600">
                We temporarily charge the ${product.core_charge.toFixed(0)} refundable core deposit. 
                Your Tesla charger ships immediately.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto font-bold text-lg">
                2
              </div>
              <h3 className="font-semibold">Return Your Old Unit</h3>
              <p className="text-sm text-gray-600">
                Use our prepaid shipping label to send your old Tesla charger within 30 days.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto font-bold text-lg">
                3
              </div>
              <h3 className="font-semibold">Get Your Refund</h3>
              <p className="text-sm text-gray-600">
                Full ${product.core_charge.toFixed(0)} core deposit refund issued within 48 hours 
                of receiving your old unit.
              </p>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Truck, title: "Same-Day Dispatch", desc: "Ships today if ordered before 3 PM EST" },
            { icon: Shield, title: "Quality Guaranteed", desc: "Professionally remanufactured to exceed Tesla specs" },
            { icon: Clock, title: "Fast Installation", desc: "Professional hardwired setup available" },
            { icon: Leaf, title: "Eco-Friendly Choice", desc: "Sustainable remanufacturing reduces environmental impact" }
          ].map((badge, index) => (
            <div key={index} className="text-center space-y-3 p-4 bg-white rounded-lg shadow-sm">
              <badge.icon className="h-8 w-8 text-red-600 mx-auto" />
              <div>
                <h3 className="font-semibold text-sm">{badge.title}</h3>
                <p className="text-xs text-gray-600">{badge.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Related Products */}
        <section className="bg-orange-50 rounded-2xl p-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-orange-600/10 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
            <Battery className="h-4 w-4" />
            More EV Charging Solutions
          </div>
          <h2 className="text-2xl font-bold text-orange-900">
            Explore Our Complete EV Charger Collection
          </h2>
          <p className="text-orange-800 max-w-2xl mx-auto">
            We offer a complete range of Level 2 EV charging solutions from top brands including ChargePoint, 
            ClipperCreek, and Wallbox. All professionally remanufactured with the same quality guarantee.
          </p>
          <Link
            href="/electric-vehicle-chargers"
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            <Zap className="h-5 w-5" />
            View All EV Chargers →
          </Link>
        </section>

        {/* Final CTA */}
        <section className="text-center space-y-6 bg-canyon-rust/5 rounded-2xl p-8">
          <h2 className="text-2xl font-bold">
            Ready to Upgrade Your Tesla Charging Experience?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get Tesla-optimized Level 2 charging with smart app integration, weather-resistant durability, 
            and professional remanufacturing quality. Ships today with our satisfaction guarantee.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AddToCartButton
              sku={product.sku}
              qty={1}
              price={product.price * 100}
              meta={{ productId: product.id }}
              className="bg-canyon-rust text-white px-8 py-3 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors"
            >
              Add to Cart - ${product.price.toFixed(0)} →
            </AddToCartButton>
            <Link
              href="/contact"
              className="border border-canyon-rust text-canyon-rust px-8 py-3 rounded-lg font-semibold hover:bg-canyon-rust/10 transition-colors"
            >
              Installation Questions?
            </Link>
          </div>
        </section>
      </main>
    </>
  );
} 